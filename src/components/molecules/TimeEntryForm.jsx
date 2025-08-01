import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const TimeEntryForm = ({ timeEntry, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    projectId: "",
    description: "",
    date: "",
    duration: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (timeEntry) {
      setFormData({
        projectId: timeEntry.projectId || "",
        description: timeEntry.description || "",
        date: timeEntry.date || "",
        duration: timeEntry.duration?.toString() || ""
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        projectId: projects.length > 0 ? projects[0].Id : "",
        description: "",
        date: today,
        duration: ""
      });
    }
  }, [timeEntry, projects]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    } else {
      const duration = parseFloat(formData.duration);
      if (isNaN(duration) || duration <= 0 || duration > 24) {
        newErrors.duration = "Duration must be between 0.1 and 24 hours";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        projectId: parseInt(formData.projectId),
        duration: parseFloat(formData.duration)
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project *
        </label>
        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.projectId ? "border-red-500" : "border-gray-300"
          }`}
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.Id} value={project.Id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe the work you did..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <Input
        label="Date *"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        required
      />

      <Input
        label="Duration (hours) *"
        name="duration"
        type="number"
        step="0.1"
        min="0.1"
        max="24"
        value={formData.duration}
        onChange={handleChange}
        error={errors.duration}
        placeholder="e.g. 8.5"
        required
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          <ApperIcon name="Save" size={16} className="mr-2" />
          {timeEntry ? "Update Entry" : "Log Time"}
        </Button>
      </div>
    </form>
  );
};

export default TimeEntryForm;