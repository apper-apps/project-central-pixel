import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import ProjectForm from "@/components/molecules/ProjectForm";
import ProjectCard from "@/components/molecules/ProjectCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectsData, clientsData] = await Promise.all([
        projectService.getAll(),
        clientService.getAll()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
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

  const getClientById = (clientId) => {
    return clients.find(client => client.Id === parseInt(clientId));
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      setProjects(prev => [...prev, newProject]);
      setShowModal(false);
      toast.success("Project created successfully!");
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const updatedProject = await projectService.update(editingProject.Id, projectData);
      setProjects(prev => 
        prev.map(project => 
          project.Id === editingProject.Id ? updatedProject : project
        )
      );
      setShowModal(false);
      setEditingProject(null);
      toast.success("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project:", err);
      toast.error("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.delete(projectId);
        setProjects(prev => prev.filter(project => project.Id !== projectId));
        toast.success("Project deleted successfully!");
      } catch (err) {
        console.error("Failed to delete project:", err);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  const openCreateModal = () => {
    if (clients.length === 0) {
      toast.error("Please add at least one client before creating a project.");
      return;
    }
    setEditingProject(null);
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Track and manage your projects</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Track and manage your projects</p>
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Projects</h1>
          <p className="text-gray-600">Track and manage your projects</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Project
        </Button>
</div>
      
      <div className="space-y-4">
        <Input
          placeholder="Search projects by name, description, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>

      {projects.length === 0 ? (
        <Empty
          icon="Briefcase"
          title="No projects yet"
          description={clients.length === 0 
            ? "Add some clients first, then create projects for them."
            : "Start organizing your work by creating your first project."
          }
actionLabel={clients.length === 0 ? null : "Add Project"}
          onAction={clients.length === 0 ? null : openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(project => {
            if (!searchTerm) return true;
            const client = getClientById(project.clientId);
            return project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
          }).map((project) => (
            <ProjectCard
              key={project.Id}
              project={project}
              client={getClientById(project.clientId)}
              onEdit={openEditModal}
              onDelete={handleDeleteProject}
            />
))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingProject ? "Edit Project" : "Add New Project"}
        className="max-w-lg"
      >
        <ProjectForm
          project={editingProject}
          clients={clients}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Projects;