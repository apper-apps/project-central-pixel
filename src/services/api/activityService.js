let activities = [];
let nextId = 1;

const activityService = {
  // Get all activities with optional filtering
  getAll: (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredActivities = [...activities];
        
        // Filter by project
        if (filters.projectId) {
          filteredActivities = filteredActivities.filter(activity => 
            activity.projectId === parseInt(filters.projectId)
          );
        }
        
        // Filter by team member
        if (filters.teamMemberId) {
          filteredActivities = filteredActivities.filter(activity => 
            activity.userId === parseInt(filters.teamMemberId)
          );
        }
        
        // Filter by activity type
        if (filters.type) {
          filteredActivities = filteredActivities.filter(activity => 
            activity.type === filters.type
          );
        }
        
        // Filter by date range
        if (filters.startDate) {
          filteredActivities = filteredActivities.filter(activity => 
            new Date(activity.createdAt) >= new Date(filters.startDate)
          );
        }
        
        if (filters.endDate) {
          filteredActivities = filteredActivities.filter(activity => 
            new Date(activity.createdAt) <= new Date(filters.endDate)
          );
        }
        
        // Sort by most recent first
        filteredActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        resolve(filteredActivities);
      }, 200);
    });
  },

  // Get activities for a specific project
  getByProjectId: (projectId) => {
    if (!projectId || typeof projectId !== 'number') {
      throw new Error('Valid project ID is required');
    }
    return activityService.getAll({ projectId });
  },

  // Get activities by a specific team member
  getByTeamMember: (teamMemberId) => {
    if (!teamMemberId || typeof teamMemberId !== 'number') {
      throw new Error('Valid team member ID is required');
    }
    return activityService.getAll({ teamMemberId });
  },

  // Create a new activity
  create: (activityData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { type, userId, projectId, taskId, taskListId, commentId, fileId, milestoneId, description, metadata = {} } = activityData;
        
        if (!type || !userId) {
          throw new Error('Activity type and user ID are required');
        }
        
        const newActivity = {
          Id: nextId++,
          type,
          userId,
          projectId: projectId || null,
          taskId: taskId || null,
          taskListId: taskListId || null,
          commentId: commentId || null,
          fileId: fileId || null,
          milestoneId: milestoneId || null,
          description,
          metadata,
          createdAt: new Date().toISOString()
        };
        
        activities.push(newActivity);
        resolve({ ...newActivity });
      }, 100);
    });
  },

  // Get activity counts by type for dashboard
  getActivityCounts: (projectId = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredActivities = activities;
        
        if (projectId) {
          filteredActivities = activities.filter(activity => 
            activity.projectId === parseInt(projectId)
          );
        }
        
        const counts = {
          total: filteredActivities.length,
          task_created: 0,
          task_updated: 0,
          task_completed: 0,
          comment_created: 0,
          file_uploaded: 0,
          milestone_created: 0,
          milestone_completed: 0,
          project_updated: 0
        };
        
        filteredActivities.forEach(activity => {
          if (counts.hasOwnProperty(activity.type)) {
            counts[activity.type]++;
          }
        });
        
        resolve(counts);
      }, 100);
    });
  },

  // Get recent activities (last 24 hours)
  getRecentActivities: (limit = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivities = activities
          .filter(activity => new Date(activity.createdAt) >= oneDayAgo)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
        
        resolve(recentActivities);
      }, 100);
    });
  },

  // Clear all activities (for testing/reset)
  clearAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        activities = [];
        nextId = 1;
        resolve({ success: true });
      }, 100);
    });
  },

  // Activity type constants
  ACTIVITY_TYPES: {
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_COMPLETED: 'task_completed',
    TASK_DELETED: 'task_deleted',
    COMMENT_CREATED: 'comment_created',
    COMMENT_UPDATED: 'comment_updated',
    COMMENT_DELETED: 'comment_deleted',
    FILE_UPLOADED: 'file_uploaded',
    FILE_DELETED: 'file_deleted',
    MILESTONE_CREATED: 'milestone_created',
    MILESTONE_UPDATED: 'milestone_updated',
    MILESTONE_COMPLETED: 'milestone_completed',
    MILESTONE_DELETED: 'milestone_deleted',
    PROJECT_UPDATED: 'project_updated',
    TASKLIST_CREATED: 'tasklist_created',
    TASKLIST_UPDATED: 'tasklist_updated',
    TASKLIST_DELETED: 'tasklist_deleted'
  },

  // Get activity type display info
  getActivityTypeInfo: (type) => {
    const typeInfo = {
      task_created: { icon: 'Plus', color: 'text-green-600', bgColor: 'bg-green-100' },
      task_updated: { icon: 'Edit', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      task_completed: { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-100' },
      task_deleted: { icon: 'Trash2', color: 'text-red-600', bgColor: 'bg-red-100' },
      comment_created: { icon: 'MessageSquare', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      comment_updated: { icon: 'Edit', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      comment_deleted: { icon: 'MessageSquareX', color: 'text-red-600', bgColor: 'bg-red-100' },
      file_uploaded: { icon: 'Upload', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      file_deleted: { icon: 'FileX', color: 'text-red-600', bgColor: 'bg-red-100' },
      milestone_created: { icon: 'Flag', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      milestone_updated: { icon: 'Flag', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      milestone_completed: { icon: 'FlagTriangleRight', color: 'text-green-600', bgColor: 'bg-green-100' },
      milestone_deleted: { icon: 'FlagOff', color: 'text-red-600', bgColor: 'bg-red-100' },
      project_updated: { icon: 'Briefcase', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      tasklist_created: { icon: 'List', color: 'text-green-600', bgColor: 'bg-green-100' },
      tasklist_updated: { icon: 'ListChecks', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      tasklist_deleted: { icon: 'ListX', color: 'text-red-600', bgColor: 'bg-red-100' }
    };
    
    return typeInfo[type] || { icon: 'Activity', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

export default activityService;