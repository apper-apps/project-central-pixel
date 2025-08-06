import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import timeEntryService from "@/services/api/timeEntryService";
import projectService from "@/services/api/projectService";
import { create as createTeamMember, getAll as getAllTeamMembers, update as updateTeamMember } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Projects from "@/components/pages/Projects";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
const [editingEntry, setEditingEntry] = useState(null);
const [filter, setFilter] = useState("all"); // all, today, week, month
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, project, duration
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create, edit
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [entriesData, projectsData] = await Promise.all([
        timeEntryService.getAll(),
        projectService.getAll()
      ]);
      setTimeEntries(entriesData);
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

  const handleCreateEntry = async (entryData) => {
    try {
      setLoading(true);
      await timeEntryService.create(entryData);
      toast.success("Time entry created successfully");
      loadData();
      closeModal();
    } catch (error) {
      console.error("Error creating time entry:", error);
      toast.error("Failed to create time entry");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = async (entryData) => {
    try {
      setLoading(true);
      await timeEntryService.update(selectedEntry.Id, entryData);
      toast.success("Time entry updated successfully");
      loadData();
      closeModal();
    } catch (error) {
      console.error("Error updating time entry:", error);
      toast.error("Failed to update time entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this time entry?")) {
      return;
    }

    try {
      setLoading(true);
      await timeEntryService.delete(entryId);
      toast.success("Time entry deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedEntry(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
  };

  const getFilteredEntries = () => {
    let filtered = [...timeEntries];

    // Apply date filter
    if (filter !== "all") {
      const now = new Date();
      let startDate;

      switch (filter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(entry => new Date(entry.date) >= startDate);
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const project = getProjectById(entry.projectId);
        return (
          entry.description.toLowerCase().includes(term) ||
          project?.name.toLowerCase().includes(term)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "project":
          const projectA = getProjectById(a.projectId)?.name || "";
          const projectB = getProjectById(b.projectId)?.name || "";
          comparison = projectA.localeCompare(projectB);
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  };

  const filteredEntries = getFilteredEntries();
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);

  if (loading && timeEntries.length === 0) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage your project time entries
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Log Time
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="Clock" size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-lg font-bold text-gray-900">
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="Calendar" size={20} className="text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Entries</p>
              <p className="text-lg font-bold text-gray-900">
                {filteredEntries.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="Briefcase" size={20} className="text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-lg font-bold text-gray-900">
                {new Set(filteredEntries.map(e => e.projectId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search descriptions and projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Date Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="project-asc">Project A-Z</option>
              <option value="project-desc">Project Z-A</option>
              <option value="duration-desc">Longest First</option>
              <option value="duration-asc">Shortest First</option>
            </select>

            {(filter !== "all" || searchTerm) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                }}
                className="text-sm"
              >
                <ApperIcon name="X" size={14} className="mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Time Entries */}
      {filteredEntries.length === 0 ? (
        <Empty
          icon="Clock"
          title="No time entries found"
          description={
            searchTerm || filter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start tracking time by clicking 'Log Time' above"
          }
          action={
            <Button onClick={openCreateModal} variant="primary">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Log Your First Entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const project = getProjectById(entry.projectId);
            return (
              <TimeEntryCard
                key={entry.Id}
                timeEntry={entry}
                project={project}
                onEdit={() => openEditModal(entry)}
                onDelete={() => handleDeleteEntry(entry.Id)}
              />
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Log Time Entry" : "Edit Time Entry"}
        size="md"
      >
        <TimeEntryForm
          timeEntry={selectedEntry}
          projects={projects}
          onSubmit={modalMode === "create" ? handleCreateEntry : handleEditEntry}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default TimeTracking;