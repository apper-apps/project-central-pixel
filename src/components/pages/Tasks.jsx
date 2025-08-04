import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import taskService from "@/services/api/taskService";
import projectService from "@/services/api/projectService";
import { create, getAll, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TaskForm from "@/components/molecules/TaskForm";
import TaskCard from "@/components/molecules/TaskCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
const [filter, setFilter] = useState("all"); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState("");
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProjectById = (projectId) => {
    return projects.find(project => project.Id === parseInt(projectId));
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowModal(false);
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
      setShowModal(false);
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

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const updatedTask = await taskService.update(taskId, { completed });
      setTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success(completed ? "Task marked as completed!" : "Task marked as pending!");
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const openCreateModal = () => {
    if (projects.length === 0) {
      toast.error("Please add at least one project before creating a task.");
      return;
    }
    setEditingTask(null);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter === "all" || 
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);
    
    const matchesSearch = !searchTerm || 
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectById(task.projectId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage your project tasks</p>
          </div>
        </div>
        <Loading type="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage your project tasks</p>
          </div>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Tasks</h1>
          <p className="text-gray-600">Manage your project tasks</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>
<div className="space-y-4">
        <Input
          placeholder="Search tasks by title, description, or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>
      {tasks.length > 0 && (
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: "all", label: "All", count: taskCounts.all },
            { key: "pending", label: "Pending", count: taskCounts.pending },
            { key: "completed", label: "Completed", count: taskCounts.completed }
          ].map((filterOption) => (
<button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption.key 
                  ? "text-white shadow-sm"
                  : "hover:text-gray-900"
              }`}
              style={filter === filterOption.key ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title={
            tasks.length === 0 
              ? "No tasks yet" 
              : filter === "completed" 
                ? "No completed tasks"
                : "No pending tasks"
          }
          description={
            tasks.length === 0
              ? projects.length === 0 
                ? "Add some projects first, then create tasks for them."
                : "Start organizing your work by creating your first task."
              : filter === "completed"
                ? "Complete some tasks to see them here."
                : "All tasks are completed! Great job!"
          }
          actionLabel={tasks.length === 0 && projects.length > 0 ? "Add Task" : null}
          onAction={tasks.length === 0 && projects.length > 0 ? openCreateModal : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.Id}
              task={task}
              project={getProjectById(task.projectId)}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingTask ? "Edit Task" : "Add New Task"}
        className="max-w-lg"
      >
        <TaskForm
          task={editingTask}
          projects={projects}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Tasks;