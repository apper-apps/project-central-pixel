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
const [viewMode, setViewMode] = useState("grid"); // grid, list, calendar
  const [calendarDate, setCalendarDate] = useState(new Date());
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
      let startDate, endDate;

      switch (filter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          break;
        case "week":
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "calendar-month":
          // Filter for calendar's current month
          startDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
          endDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          if (endDate) {
            return entryDate >= startDate && entryDate <= endDate;
          }
          return entryDate >= startDate;
        });
      }
    }

    // For calendar view, always show entries for the visible calendar range
    if (viewMode === "calendar" && filter === "all") {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 42); // 6 weeks

      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate < endDate;
      });
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

    // Apply sorting (not needed for calendar view)
    if (viewMode !== "calendar") {
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
    }

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
        <div className="flex flex-col gap-4">
          {/* Search and View Mode Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search descriptions and projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="Grid3X3" size={16} className="mr-1" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="List" size={16} className="mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ApperIcon name="Calendar" size={16} className="mr-1" />
                Calendar
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            {/* Date Filter */}
<select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{viewMode === "calendar" ? "All Entries" : "All Time"}</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              {viewMode === "calendar" && (
                <option value="calendar-month">Current Calendar Month</option>
              )}
            </select>

            {/* Sort Options - Hide in calendar view */}
            {viewMode !== "calendar" && (
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
            )}

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

{/* Calendar View */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(calendarDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCalendarDate(newDate);
                  }}
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCalendarDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(calendarDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCalendarDate(newDate);
                  }}
                >
                  <ApperIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                const days = [];
                const currentDate = new Date(startDate);
                
                for (let i = 0; i < 42; i++) {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  const dayEntries = filteredEntries.filter(entry => entry.date === dateStr);
                  const totalHours = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
                  const isCurrentMonth = currentDate.getMonth() === month;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  days.push(
                    <div
                      key={dateStr}
                      className={`min-h-[100px] p-1 border border-gray-100 transition-colors ${
                        isCurrentMonth 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-gray-50 text-gray-400'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {currentDate.getDate()}
                        </span>
                        {totalHours > 0 && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {totalHours}h
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEntries.slice(0, 3).map((entry) => {
                          const project = getProjectById(entry.projectId);
                          const projectColors = {
                            1: 'bg-blue-500',
                            2: 'bg-green-500',
                            3: 'bg-purple-500',
                            4: 'bg-orange-500',
                          };
                          
                          return (
                            <div
                              key={entry.Id}
                              className={`text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity ${
                                projectColors[entry.projectId] || 'bg-gray-500'
                              }`}
                              title={`${project?.name || 'Unknown Project'}: ${entry.description} (${entry.duration}h)`}
                              onClick={() => openEditModal(entry)}
                            >
                              <div className="truncate font-medium">
                                {project?.name || 'Unknown'}
                              </div>
                              <div className="truncate opacity-90">
                                {entry.description}
                              </div>
                            </div>
                          );
                        })}
                        
                        {dayEntries.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{dayEntries.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return days;
              })()}
            </div>
          </div>
        </div>
      ) : (
        <>
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
            <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
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
        </>
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