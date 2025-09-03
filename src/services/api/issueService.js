// Issue service with Apper backend integration
// Table: issue_c - Issue management with comprehensive tracking
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize ApperClient
const getApperClient = () => {
  if (typeof window === 'undefined' || !window.ApperSDK) {
    throw new Error('ApperSDK not available');
  }
  
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const TABLE_NAME = 'issue_c';

// Helper function to extract mentions from content
function extractMentions(content) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

// Get all issues with filtering and pagination
export const getAll = async (filters = {}) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "reporter_c" } },
        { field: { Name: "assignee_c" } },
        { field: { Name: "environment_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "updated_at_c" } },
        { field: { Name: "project_id_c" } }
      ],
      orderBy: [
        {
          fieldName: "created_at_c",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: filters.limit || 50,
        offset: filters.offset || 0
      }
    };

    // Add filtering if provided
    if (filters.status) {
      params.where = [
        {
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: [filters.status]
        }
      ];
    }

    if (filters.priority) {
      params.where = params.where || [];
      params.where.push({
        FieldName: "priority_c",
        Operator: "EqualTo", 
        Values: [filters.priority]
      });
    }

    if (filters.projectId) {
      params.where = params.where || [];
      params.where.push({
        FieldName: "project_id_c",
        Operator: "EqualTo",
        Values: [parseInt(filters.projectId)]
      });
    }

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching issues:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Get single issue by ID
export const getById = async (id) => {
  await delay(200);
  
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "reporter_c" } },
        { field: { Name: "assignee_c" } },
        { field: { Name: "environment_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "updated_at_c" } },
        { field: { Name: "project_id_c" } }
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching issue with ID ${id}:`, error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Create new issue
export const create = async (issueData) => {
  await delay(400);
  
  try {
    const apperClient = getApperClient();
    
    // Only include Updateable fields
    const params = {
      records: [
        {
          Name: issueData.Name || issueData.title_c,
          Tags: issueData.Tags || '',
          title_c: issueData.title_c,
          type_c: issueData.type_c,
          description_c: issueData.description_c,
          priority_c: issueData.priority_c,
          status_c: issueData.status_c || 'To Do',
          reporter_c: issueData.reporter_c,
          assignee_c: issueData.assignee_c,
          environment_c: issueData.environment_c,
          due_date_c: issueData.due_date_c,
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString(),
          project_id_c: issueData.project_id_c ? parseInt(issueData.project_id_c) : null
        }
      ]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} issue records:${JSON.stringify(failedRecords)}`);
      }
      
      return successfulRecords.length > 0 ? successfulRecords[0].data : null;
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating issue:", error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Update existing issue
export const update = async (id, issueData) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    
    // Only include Updateable fields
    const updateData = {
      Id: parseInt(id)
    };

    // Only include fields that are being updated
    if (issueData.Name !== undefined) updateData.Name = issueData.Name;
    if (issueData.Tags !== undefined) updateData.Tags = issueData.Tags;
    if (issueData.title_c !== undefined) updateData.title_c = issueData.title_c;
    if (issueData.type_c !== undefined) updateData.type_c = issueData.type_c;
    if (issueData.description_c !== undefined) updateData.description_c = issueData.description_c;
    if (issueData.priority_c !== undefined) updateData.priority_c = issueData.priority_c;
    if (issueData.status_c !== undefined) updateData.status_c = issueData.status_c;
    if (issueData.reporter_c !== undefined) updateData.reporter_c = issueData.reporter_c;
    if (issueData.assignee_c !== undefined) updateData.assignee_c = issueData.assignee_c;
    if (issueData.environment_c !== undefined) updateData.environment_c = issueData.environment_c;
    if (issueData.due_date_c !== undefined) updateData.due_date_c = issueData.due_date_c;
    if (issueData.project_id_c !== undefined) updateData.project_id_c = issueData.project_id_c ? parseInt(issueData.project_id_c) : null;
    
    // Always update the modified timestamp
    updateData.updated_at_c = new Date().toISOString();

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} issue records:${JSON.stringify(failedUpdates)}`);
      }
      
      return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating issue:", error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Delete issue
export const remove = async (id) => {
  await delay(250);
  
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} issue records:${JSON.stringify(failedDeletions)}`);
      }
      
      return successfulDeletions.length > 0;
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting issue:", error.response.data.message);
    } else {
      console.error(error);
    }
    return false;
  }
};

// Search issues
export const searchIssues = async (searchTerm) => {
  await delay(300);
  
  try {
    const apperClient = getApperClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "assignee_c" } },
        { field: { Name: "project_id_c" } },
        { field: { Name: "created_at_c" } }
      ],
      whereGroups: [
        {
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "title_c",
                  operator: "Contains",
                  subOperator: "",
                  values: [searchTerm]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "description_c",
                  operator: "Contains",
                  subOperator: "",
                  values: [searchTerm]
                }
              ],
              operator: "OR"
            }
          ]
        }
      ],
      orderBy: [
        {
          fieldName: "created_at_c",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 50,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error searching issues:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Placeholder comment methods for compatibility
export const getCommentsByIssueId = async (issueId) => {
  // TODO: Implement when comment functionality is needed
  await delay(200);
  return [];
};

export const createComment = async (commentData) => {
  // TODO: Implement when comment functionality is needed
  await delay(300);
  return null;
};

export const updateComment = async (id, commentData) => {
  // TODO: Implement when comment functionality is needed
  await delay(250);
  return null;
};

export const deleteComment = async (id) => {
  // TODO: Implement when comment functionality is needed
  await delay(200);
  return false;
};

// Default export for compatibility
const issueService = {
  getAll,
  getById,
  create,
  update,
  remove,
  searchIssues,
  getCommentsByIssueId,
  createComment,
  updateComment,
  deleteComment
};

export default issueService;

// Issue types configuration
export const issueTypes = [
  {
    id: 'Bug',
    name: 'Bug',
    icon: 'Bug',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'Task',
    name: 'Task',
    icon: 'CheckSquare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'Feature Request',
    name: 'Feature Request',
    icon: 'Lightbulb',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'Improvement',
    name: 'Improvement',
    icon: 'TrendingUp',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

// Priority levels
export const priorityLevels = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// Status workflow
export const statusWorkflow = ['To Do', 'In Progress', 'In Review', 'Done'];

// Environment options
export const environments = ['Production', 'Staging', 'Development'];