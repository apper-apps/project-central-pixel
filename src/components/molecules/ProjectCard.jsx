import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const ProjectCard = ({ project, client, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
<Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate"
              onClick={() => navigate(`/projects/${project.Id}`)}
            >
              {project.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          
          {client && (
            <div className="flex items-center gap-1 mb-2">
              <ApperIcon name="User" size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600 truncate">{client.name}</span>
            </div>
          )}
          
          {project.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
{project.deadline && (
            <div className="flex items-center gap-1 mb-2">
              <ApperIcon name="Calendar" size={14} className="text-gray-400" />
              <span className="text-xs text-gray-600">Due: {formatDate(project.deadline)}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Milestone Progress */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Milestones</span>
                <span className="text-xs font-medium text-gray-700">
                  {project.milestones.filter(m => m.isCompleted).length}/{project.milestones.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="milestone-progress-bar h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${project.milestones.length > 0 ? 
                      Math.round((project.milestones.filter(m => m.isCompleted).length / project.milestones.length) * 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {project.deliverables && (
            <p className="text-xs text-gray-500 line-clamp-1">
              <span className="font-medium">Deliverables:</span> {project.deliverables}
            </p>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(project)}
            className="p-2"
          >
            <ApperIcon name="Edit2" size={16} />
          </Button>
          <Button 
            variant="ghost" 
size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.Id);
            }}
            className="p-2 hover:text-red-600"
          >
            <ApperIcon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;