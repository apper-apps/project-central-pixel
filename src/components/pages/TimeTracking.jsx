import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import timeEntryService from "@/services/api/timeEntryService";
import projectService from "@/services/api/projectService";

const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // all, today, week, month

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
      const newEntry = await timeEntryService.create(entryData);
      setTimeEntries(prev => [newEntry, ...prev]);
      setShowModal(false);
      toast.success("Time entry logged successfully!");
    } catch (err) {
      console.error("Failed to create time entry:", err);
      toast.error("Failed to log time entry. Please try again.");
    }
  };

  const handleEditEntry = async (entryData) => {
    try {
      const updatedEntry = await timeEntryService.update(editingEntry.Id, entryData);
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.Id === editingEntry.Id ? updatedEntry : entry
        )
      );
      setShowModal(false);
      setEditingEntry(null);
      toast.success("Time entry updated successfully!");
    } catch (err) {
      console.error("Failed to update time entry:", err);
      toast.error("Failed to update time entry. Please try again.");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        await timeEntryService.delete(entryId);
        setTimeEntries(prev => prev.filter(entry => entry.Id !== entryId));
        toast.success("Time entry deleted successfully!");
      } catch (err) {
        console.error("Failed to delete time entry:", err);
        toast.error("Failed to delete time entry. Please try again.");
      }
    }
  };

  const openCreateModal = () => {
    if (projects.length === 0) {
      toast.error("Please add at least one project before logging time.");
      return;
    }
    setEditingEntry(null);
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return timeEntries.filter(entry => {
      if (filter === "today") {
        return entry.date === today;
      }
      if (filter === "week") {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      }
      if (filter === "month") {
        const entryDate = new Date(entry.date);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredEntries = getFilteredEntries();
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const filterOptions = [
    { key: "all", label: "All Time", count: timeEntries.length },
    { key: "today", label: "Today", count: timeEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).length },
    { key: "week", label: "This Week", count: timeEntries.filter(e => new Date(e.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
    { key: "month", label: "This Month", count: timeEntries.filter(e => new Date(e.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracking</h1>
            <p className="text-gray-600">Log and manage your time entries</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracking</h1>
            <p className="text-gray-600">Log and manage your time entries</p>
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Time Tracking</h1>
          <p className="text-gray-600">Log and manage your time entries</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Log Time
        </Button>
      </div>

      {timeEntries.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {filterOptions.map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <Empty
          icon="Clock"
          title={
            timeEntries.length === 0 
              ? "No time entries yet" 
              : filter === "today"
                ? "No entries for today"
                : filter === "week"
                  ? "No entries this week"
                  : filter === "month"
                    ? "No entries this month"
                    : "No entries found"
          }
          description={
            timeEntries.length === 0
              ? projects.length === 0 
                ? "Add some projects first, then start logging your time."
                : "Start tracking your work by logging your first time entry."
              : "Try adjusting your filter or log some time for the selected period."
          }
          actionLabel={timeEntries.length === 0 && projects.length > 0 ? "Log Time" : null}
          onAction={timeEntries.length === 0 && projects.length > 0 ? openCreateModal : null}
        />
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <TimeEntryCard
              key={entry.Id}
              timeEntry={entry}
              project={getProjectById(entry.projectId)}
              onEdit={openEditModal}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingEntry ? "Edit Time Entry" : "Log Time Entry"}
        className="max-w-lg"
      >
        <TimeEntryForm
          timeEntry={editingEntry}
          projects={projects}
          onSubmit={editingEntry ? handleEditEntry : handleCreateEntry}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default TimeTracking;