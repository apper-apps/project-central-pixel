import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import timeEntryService from "@/services/api/timeEntryService";
import projectService from "@/services/api/projectService";
import { create, getAll, update } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import TimeEntryCard from "@/components/molecules/TimeEntryCard";
import TimeEntryForm from "@/components/molecules/TimeEntryForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
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
      const matchesTimeFilter = filter === "all" ||
        (filter === "today" && entry.date === today) ||
        (filter === "week" && new Date(entry.date) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (filter === "month" && new Date(entry.date) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      
      const matchesSearch = !searchTerm || 
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectById(entry.projectId)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTimeFilter && matchesSearch;
    });
  };

const filteredEntries = getFilteredEntries();
const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration || entry.hours || 0), 0);
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
<div className="space-y-4">
        <Input
          placeholder="Search time entries by description or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<ApperIcon name="Search" size={16} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>

{timeEntries.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {filterOptions.map((filterOption) => (
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
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" 
                    ? "text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
                style={viewMode === "grid" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
              >
                <ApperIcon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" 
                    ? "text-white shadow-sm"
                    : "hover:text-gray-900"
                }`}
                style={viewMode === "list" ? {backgroundColor: '#4A90E2', color: 'white'} : {color: '#6B7280'}}
              >
                <ApperIcon name="List" size={16} />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-2xl font-bold" style={{color: '#4A90E2'}}>{totalHours.toFixed(1)}h</p>
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
        viewMode === "grid" ? (
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
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEntries.map((entry) => {
                    const project = getProjectById(entry.projectId);
                    return (
                      <tr key={entry.Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: project?.color || '#4A90E2'}}></div>
                            <span className="text-sm font-medium text-gray-900">{project?.name || 'Unknown Project'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {entry.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(entry.duration || entry.hours || 0)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(entry)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ApperIcon name="Edit2" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.Id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
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