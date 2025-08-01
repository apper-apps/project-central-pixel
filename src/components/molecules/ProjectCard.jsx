import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const ProjectCard = ({ project, client, onEdit, onDelete }) => {
  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
          <p className="text-sm text-blue-600 mb-2">{client?.name || "Unknown Client"}</p>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {project.description}
          </p>
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
            onClick={() => onDelete(project.Id)}
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