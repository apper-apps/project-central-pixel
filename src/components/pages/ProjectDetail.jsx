import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { addDays, differenceInDays, endOfDay, format, parseISO, startOfDay } from "date-fns";
import taskService from "@/services/api/taskService";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import { create, getAll, getById, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import MilestoneCard from "@/components/molecules/MilestoneCard";
import TaskForm from "@/components/molecules/TaskForm";
import ProjectForm from "@/components/molecules/ProjectForm";
import TaskCard from "@/components/molecules/TaskCard";
import MilestoneForm from "@/components/molecules/MilestoneForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Tasks from "@/components/pages/Tasks";
import Projects from "@/components/pages/Projects";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import Card from "@/components/atoms/Card";
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [activeTab, setActiveTab] = useState('grid');
  const [timelineView, setTimelineView] = useState('month');
  const [timelineStart, setTimelineStart] = useState(new Date());
  const timelineRef = useRef(null);
  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [projectData, tasksData, clientsData, projectsData, milestonesData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProjectId(id),
        clientService.getAll(),
        projectService.getAll(),
projectService.getMilestonesByProjectId(id)
      ]);
      setProject(projectData);
      setMilestones(milestonesData || []);
      setTasks(tasksData);
      setClients(clientsData);
      setProjects(projectsData);
      
      // Find the client for this project
      const projectClient = clientsData.find(c => c.Id === projectData.clientId);
      setClient(projectClient);
    } catch (err) {
      console.error("Failed to load project data:", err);
      setError("Failed to load project information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

const handleEditProject = async (projectData) => {
    try {
      const updatedProject = await projectService.update(project.Id, projectData);
      setProject(updatedProject);
      
      // Update client if changed
      const newClient = clients.find(c => c.Id === updatedProject.clientId);
      setClient(newClient);
      
      setShowEditModal(false);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project. Please try again.");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create({
        ...taskData,
        projectId: project.Id
      });
      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      toast.success("Task created successfully!");
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Failed to create task. Please try again.");
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.update(editingTask.Id, taskData);
      setTasks(prev => 
        prev.map(task => 
          task.Id === editingTask.Id ? updatedTask : task
        )
      );
      setShowTaskModal(false);
      setEditingTask(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.delete(taskId);
        setTasks(prev => prev.filter(task => task.Id !== taskId));
        toast.success("Task deleted successfully!");
      } catch (err) {
        console.error("Failed to delete task:", err);
        toast.error("Failed to delete task. Please try again.");
      }
    }
  };

const handleCreateMilestone = async (milestoneData) => {
    try {
      const newMilestone = await projectService.createMilestone(project.Id, milestoneData);
      setMilestones(prev => [...prev, newMilestone]);
      setShowMilestoneModal(false);
      toast.success("Milestone created successfully!");
    } catch (err) {
      console.error("Failed to create milestone:", err);
      toast.error("Failed to create milestone. Please try again.");
    }
  };

  const handleEditMilestone = async (milestoneData) => {
    try {
      const updatedMilestone = await projectService.updateMilestone(editingMilestone.Id, milestoneData);
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.Id === editingMilestone.Id ? updatedMilestone : milestone
        )
      );
      setShowMilestoneModal(false);
      setEditingMilestone(null);
      toast.success("Milestone updated successfully!");
    } catch (err) {
      console.error("Failed to update milestone:", err);
      toast.error("Failed to update milestone. Please try again.");
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        await projectService.deleteMilestone(milestoneId);
        setMilestones(prev => prev.filter(milestone => milestone.Id !== milestoneId));
        toast.success("Milestone deleted successfully!");
      } catch (err) {
        console.error("Failed to delete milestone:", err);
        toast.error("Failed to delete milestone. Please try again.");
      }
    }
  };

  const handleToggleMilestoneComplete = async (milestoneId, isCompleted) => {
    try {
      const milestone = milestones.find(m => m.Id === milestoneId);
      const updatedMilestone = await projectService.updateMilestone(milestoneId, {
        ...milestone,
        isCompleted,
        completedDate: isCompleted ? new Date().toISOString() : null
      });
      setMilestones(prev => 
        prev.map(m => m.Id === milestoneId ? updatedMilestone : m)
      );
      toast.success(`Milestone ${isCompleted ? 'completed' : 'reopened'}!`);
    } catch (err) {
      console.error("Failed to update milestone:", err);
toast.error("Failed to update milestone. Please try again.");
    }
  };

  const handleTimelineTaskUpdate = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.update(taskId, updates);
      setTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };
  const openEditModal = () => {
setShowEditModal(true);
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
setShowTaskModal(true);
  };

  const openCreateMilestoneModal = () => {
    setEditingMilestone(null);
    setShowMilestoneModal(true);
  };

  const openEditMilestoneModal = (milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowTaskModal(false);
    setShowMilestoneModal(false);
    setEditingTask(null);
    setEditingMilestone(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString();
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  };

  const getMilestoneStats = () => {
    const total = milestones.length;
    const completed = milestones.filter(milestone => milestone.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  };

  if (loading) {
return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <Loading type="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <Error message={error} onRetry={loadProjectData} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }
const taskStats = getTaskStats();
  const milestoneStats = getMilestoneStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{project.name}</h1>
            <p className="text-gray-600">Project Details & Tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={openEditModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Edit2" size={16} />
            Edit Project
          </Button>
          <Button
            variant="primary"
            onClick={openCreateTaskModal}
            className="flex items-center gap-2"
>
            <ApperIcon name="Plus" size={16} />
            New Task
          </Button>
          <Button 
            variant="secondary" 
            onClick={openCreateMilestoneModal}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Flag" size={16} />
            New Milestone
          </Button>
        </div>
      </div>

      {/* Project Information */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <div className="flex items-center">
              <ApperIcon name="User" size={16} className="mr-2 text-gray-500" />
              <span 
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => client && navigate(`/clients/${client.Id}`)}
              >
                {client?.name || "Unknown Client"}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
            <div className="flex items-center">
              <ApperIcon name="Calendar" size={16} className="mr-2 text-gray-500" />
              <span className="text-gray-900">{formatDate(project.deadline)}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Progress</label>
            <div className="flex items-center">
              <ApperIcon name="CheckCircle" size={16} className="mr-2 text-gray-500" />
              <span className="text-gray-900">
                {taskStats.completed}/{taskStats.total} ({taskStats.completionRate}%)
              </span>
            </div>
</div>
        </div>
      </Card>

      {/* Milestone Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Milestone Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{milestoneStats.completionRate}%</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Completed: {milestoneStats.completed}</span>
                <span>Pending: {milestoneStats.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="milestone-progress-bar h-3 rounded-full transition-all duration-300"
                  style={{ width: `${milestoneStats.completionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {milestoneStats.total} total milestones
              </p>
            </div>
          </Card>
        </div>
        {project.deliverables && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
            <p className="text-gray-900 whitespace-pre-wrap">{project.deliverables}</p>
          </div>
        )}
      </Card>

      {/* Client Information */}
      {client && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/clients/${client.Id}`)}
              className="flex items-center gap-2"
            >
              View Full Details
              <ApperIcon name="ArrowRight" size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <p className="text-gray-900">{client.company}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center">
                <ApperIcon name="Mail" size={16} className="mr-2 text-gray-500" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                  {client.email}
                </a>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="flex items-center">
                <ApperIcon name="Phone" size={16} className="mr-2 text-gray-500" />
                <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                  {client.phone}
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
{/* Milestones Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Milestones ({milestones.length})
          </h2>
        </div>

        {milestones.length === 0 ? (
          <Empty
            icon="Flag"
            title="No milestones yet"
            description="Create milestones to track key project deliverables and deadlines."
            actionLabel="Add Milestone"
            onAction={openCreateMilestoneModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.Id}
                milestone={milestone}
                onEdit={openEditMilestoneModal}
                onDelete={handleDeleteMilestone}
                onToggleComplete={handleToggleMilestoneComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
<div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Tasks ({tasks.length})
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Grid3X3" size={16} className="mr-1.5" />
                Grid
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Calendar" size={16} className="mr-1.5" />
                Timeline
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateTaskModal}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
Add Task
            </Button>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <ApperIcon name="List" size={20} className="text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl font-semibold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <ApperIcon name="CheckCircle" size={20} className="text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <ApperIcon name="Clock" size={20} className="text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold text-gray-900">{taskStats.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <ApperIcon name="TrendingUp" size={20} className="text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-semibold text-gray-900">{taskStats.completionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

{tasks.length === 0 ? (
          <Empty
            icon="CheckSquare"
            title="No tasks yet"
            description="Start by creating the first task for this project."
            actionLabel="Create Task"
            onAction={openCreateTaskModal}
          />
        ) : activeTab === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                project={project}
                onEdit={openEditTaskModal}
                onDelete={handleDeleteTask}
                onToggleComplete={async (taskId) => {
                  try {
                    const taskToUpdate = tasks.find(t => t.Id === taskId);
                    const updatedTask = await taskService.update(taskId, {
                      ...taskToUpdate,
                      completed: !taskToUpdate.completed
                    });
                    setTasks(prev => 
                      prev.map(task => 
                        task.Id === taskId ? updatedTask : task
                      )
                    );
                    toast.success(updatedTask.completed ? "Task marked as completed!" : "Task marked as pending!");
                  } catch (err) {
                    console.error("Failed to toggle task:", err);
                    toast.error("Failed to update task. Please try again.");
                  }
                }}
              />
            ))}
          </div>
) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Timeline view is coming soon!</p>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModals}
        title="Edit Project"
        className="max-w-lg"
      >
        <ProjectForm
          project={project}
          clients={clients}
          onSubmit={handleEditProject}
          onCancel={closeModals}
        />
      </Modal>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={closeModals}
        title={editingTask ? "Edit Task" : "Create New Task"}
        className="max-w-lg"
      >
        <TaskForm
          task={editingTask}
          projects={[project]} // Only show current project
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={closeModals}
        />
      </Modal>

      {/* Create/Edit Milestone Modal */}
      <Modal
        isOpen={showMilestoneModal}
        onClose={closeModals}
        title={editingMilestone ? "Edit Milestone" : "Create New Milestone"}
        className="max-w-lg"
      >
        <MilestoneForm
          milestone={editingMilestone}
          onSubmit={editingMilestone ? handleEditMilestone : handleCreateMilestone}
          onCancel={closeModals}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;