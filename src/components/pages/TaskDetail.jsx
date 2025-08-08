import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { 
  create as createIssue, 
  createIssue as createIssueAlt, 
  createIssueAlt, 
  createIssueAlt2, 
  getAll as getAllIssues, 
  getAllIssues as getAllIssuesAlt, 
  getAllIssuesAlt, 
  getAllIssuesAlt2, 
  getById as getIssueById, 
  getIssueById as getIssueByIdAlt, 
  getIssueByIdAlt, 
  getIssueByIdAlt2, 
  update as updateIssue, 
  updateIssue as updateIssueAlt, 
  updateIssueAlt, 
  updateIssueAlt2 
} from "@/services/api/issueService";
import taskService from "@/services/api/taskService";
import timeEntryService from "@/services/api/timeEntryService";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import { 
  create as createTeamMember, 
  createTeamMember as createTeamMemberAlt, 
  createTeamMemberAlt, 
  createTeamMemberAlt2, 
  getAll as getAllTeamMembers, 
  getAllTeamMembers as getAllTeamMembersAlt, 
  getAllTeamMembersAlt, 
  getAllTeamMembersAlt2, 
  getById as getTeamMemberById, 
  getTeamMemberById as getTeamMemberByIdAlt, 
  getTeamMemberByIdAlt, 
  getTeamMemberByIdAlt2, 
  update as updateTeamMember, 
  updateTeamMember as updateTeamMemberAlt, 
  updateTeamMemberAlt, 
  updateTeamMemberAlt2 
} from "@/services/api/teamMemberService";
import activityService from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import TaskForm from "@/components/molecules/TaskForm";
import CommentThread from "@/components/molecules/CommentThread";
import CollaborationSection from "@/components/molecules/CollaborationSection";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Tasks from "@/components/pages/Tasks";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";
const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [taskLists, setTaskLists] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [showTimeModal, setShowTimeModal] = useState(false);
const [showCollaboration, setShowCollaboration] = useState(false);
const [timeEntries, setTimeEntries] = useState([]);
const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
const [activeTab, setActiveTab] = useState('details');
const [showTimeForm, setShowTimeForm] = useState(false);
const [editingTime, setEditingTime] = useState(null);
useEffect(() => {
    loadTaskData();
  }, [id]);

const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all required data for the edit form
const [taskData, projectsData, taskTimeEntries] = await Promise.all([
        taskService.getById(parseInt(id)),
        projectService.getAll(),
        timeEntryService.getByTaskId(parseInt(id))
      ]);

      if (!taskData) {
        setError("Task not found");
        return;
      }

      setTask(taskData);
      setProjects(projectsData);
      setTimeEntries(taskTimeEntries);
      // Load related project data
      if (taskData.projectId) {
        const projectData = await projectService.getById(taskData.projectId);
        setProject(projectData);

        // Load client data if project has one
        if (projectData?.clientId) {
          const clientData = await clientService.getById(projectData.clientId);
          setClient(clientData);
        }
      }
    } catch (err) {
      console.error("Error loading task:", err);
      setError("Failed to load task details");
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.update(task.Id, taskData);
      setTask(updatedTask);
      setShowEditModal(false);
      toast.success("Task updated successfully");

      // Log activity
      await activityService.create({
        type: "task",
        action: "updated",
        description: `Task "${updatedTask.name}" was updated`,
        entityId: updatedTask.Id,
        projectId: updatedTask.projectId,
        userId: 1 // Current user
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleToggleComplete = async () => {
    try {
      const newCompleted = !task.completed;
      const updatedTask = await taskService.update(task.Id, { 
        ...task, 
        completed: newCompleted 
      });
      setTask(updatedTask);
      
      toast.success(`Task ${newCompleted ? 'completed' : 'reopened'}`);

      // Log activity
      await activityService.create({
        type: "task",
        action: newCompleted ? "completed" : "reopened",
        description: `Task "${updatedTask.name}" was ${newCompleted ? 'completed' : 'reopened'}`,
        entityId: updatedTask.Id,
        projectId: updatedTask.projectId,
        userId: 1
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      await taskService.delete(task.Id);
      toast.success("Task deleted successfully");

      // Log activity
      await activityService.create({
        type: "task",
        action: "deleted",
        description: `Task "${task.name}" was deleted`,
        projectId: task.projectId,
        userId: 1
      });

      // Navigate back to project or tasks page
if (project) {
        navigate(`/projects/${project.Id}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };
const handleAddTime = async (timeData) => {
  try {
    const timeEntry = await timeEntryService.create({
      ...timeData,
      taskId: task.Id,
      projectId: task.projectId
    });
    
    // Refresh time entries
    const updatedTimeEntries = await timeEntryService.getByTaskId(parseInt(id));
    setTimeEntries(updatedTimeEntries);
    
    setShowTimeModal(false);
    setShowTimeForm(false);
    setEditingTime(null);
    toast.success("Time entry logged successfully");

    // Log activity
    await activityService.create({
      type: "time",
      action: "logged",
      description: `${timeData.duration} hours logged for task "${task.name}"`,
      entityId: timeEntry.Id,
      projectId: task.projectId,
      userId: 1
    });
  } catch (error) {
    console.error("Error logging time:", error);
    toast.error("Failed to log time entry");
  }
};

const handleDeleteTime = async (timeEntryId) => {
  if (!confirm("Are you sure you want to delete this time entry?")) {
    return;
  }

  try {
    await timeEntryService.delete(timeEntryId);
    
    // Refresh time entries
    const updatedTimeEntries = await timeEntryService.getByTaskId(parseInt(id));
    setTimeEntries(updatedTimeEntries);
    
    toast.success("Time entry deleted successfully");
  } catch (error) {
console.error("Error deleting time entry:", error);
    toast.error("Failed to delete time entry");
  }
};

const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'status-urgent';
      case 'Medium':
        return 'status-in-progress';
      case 'Low':
        return 'status-completed';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTaskData} />;
  if (!task) return <Error message="Task not found" />;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button 
          onClick={() => navigate('/tasks')} 
          className="hover:text-gray-700 transition-colors"
        >
          Tasks
        </button>
        {project && (
          <>
            <ApperIcon name="ChevronRight" size={16} />
            <button 
              onClick={() => navigate(`/projects/${project.Id}`)}
              className="hover:text-gray-700 transition-colors"
            >
              {project.name}
            </button>
          </>
        )}
        <ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900 font-medium">{task.name}</span>
      </div>

      {/* Task Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-2xl font-bold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.name}
              </h1>
              {task.priority && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.completed ? 'status-completed' : 'status-in-progress'
              }`}>
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Project Context */}
            {project && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <ApperIcon name="Folder" size={16} />
                <button 
                  onClick={() => navigate(`/projects/${project.Id}`)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {project.name}
                </button>
                {client && (
                  <>
                    <span>•</span>
                    <button 
                      onClick={() => navigate(`/clients/${client.Id}`)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {client.name}
                    </button>
                  </>
                )}
              </div>
            )}

            {task.description && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

<div className="flex items-center gap-2 ml-6">
<Button
variant="outline"
onClick={() => setShowTimeModal(true)}
className="flex items-center gap-2"
>
<ApperIcon name="Clock" size={16} />
Add Time
</Button>
<Button
variant="outline"
onClick={() => setShowEditModal(true)}
className="flex items-center gap-2"
>
<ApperIcon name="Edit" size={16} />
Edit
</Button>
            <Button
              variant={task.completed ? "outline" : "primary"}
              onClick={handleToggleComplete}
              className="flex items-center gap-2"
            >
              <ApperIcon name={task.completed ? "RotateCcw" : "Check"} size={16} />
              {task.completed ? 'Reopen' : 'Complete'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteTask}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <ApperIcon name="Trash2" size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Task Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
            <div className="flex items-center gap-2 text-gray-900">
              <ApperIcon name="Calendar" size={16} />
              <span>{formatDate(task.startDate)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
            <div className="flex items-center gap-2 text-gray-900">
              <ApperIcon name="CalendarClock" size={16} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <div className="flex items-center gap-2 text-gray-900">
              <ApperIcon name="Plus" size={16} />
              <span>{formatDate(task.createdAt)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <div className="flex items-center gap-2">
              <ApperIcon 
                name={task.completed ? "CheckCircle" : "Clock"} 
                size={16} 
                className={task.completed ? "text-green-600" : "text-yellow-600"}
              />
              <span className="text-gray-900">
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
</Card>

      {/* Tab Navigation */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details & Comments
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'time'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Time Entries
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="p-6">
            {/* Collaboration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
          <CollaborationSection 
            taskId={task.Id}
            projectId={task.projectId}
            isExpanded={showCollaboration}
            onToggle={() => setShowCollaboration(!showCollaboration)}
          />
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ApperIcon name="BarChart3" size={16} />
              Task Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Priority</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-gray-900">
                  {task.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              {task.dueDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time Remaining</span>
                  <span className="font-medium text-gray-900">
                    {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Related Project Info */}
          {project && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ApperIcon name="Folder" size={16} />
                Project Details
              </h3>
              <div className="space-y-3">
                <div>
                  <button 
                    onClick={() => navigate(`/projects/${project.Id}`)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    {project.name}
                  </button>
                  {project.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                {client && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Client</span>
                    <button 
                      onClick={() => navigate(`/clients/${client.Id}`)}
                      className="block text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
{client.name}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
        {/* Time Spent Tab Content */
        {activeTab === 'time' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowTimeForm(true)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={16} />
                Log Time
              </Button>
            </div>
            
            {timeEntriesLoading ? (
              <Loading />
            ) : timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No time entries yet</h3>
                <p className="text-gray-600 mb-4">Start tracking time spent on this task</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowTimeForm(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <ApperIcon name="Plus" size={16} />
                  Log Time
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <TimeEntryCard
                    key={entry.Id}
                    timeEntry={entry}
                    project={projects.find(p => p.Id === entry.projectId)}
                    onEdit={() => {
                      setEditingTime(entry);
                      setShowTimeForm(true);
                    }}
                    onDelete={() => handleDeleteTime(entry.Id)}
                  />
                ))}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Time:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {timeEntries.reduce((total, entry) => total + entry.duration, 0).toFixed(1)} hours
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
</Card>

      {/* Edit Task Modal */
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
      >
<TaskForm
          task={task}
          projects={projects}
          milestones={milestones}
          taskLists={taskLists}
          onSubmit={handleEditTask}
          onCancel={() => setShowEditModal(false)}
        />
</Modal>

{/* Add Time Modal */}
<Modal 
isOpen={showTimeModal} 
onClose={() => setShowTimeModal(false)}
title="Log Time"
>
<TimeEntryForm
projects={projects}
timeEntry={{
projectId: task.projectId,
taskId: task.Id,
description: `Work on ${task.name}`
}}
onSubmit={handleAddTime}
onCancel={() => setShowTimeModal(false)}
/>
</Modal>

{/* Time Entry Form Modal */}
<Modal 
  isOpen={showTimeForm} 
  onClose={() => {
    setShowTimeForm(false);
    setEditingTime(null);
  }}
  title={editingTime ? "Edit Time Entry" : "Log Time"}
>
  <TimeEntryForm
    projects={projects}
    timeEntry={editingTime || {
      projectId: task.projectId,
      taskId: task.Id,
      description: `Work on ${task.name}`
    }}
    onSubmit={handleAddTime}
    onCancel={() => {
      setShowTimeForm(false);
      setEditingTime(null);
    }}
  />
</Modal>
    </div>
  );
};

export default TaskDetail;