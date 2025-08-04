import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const getStatusBadge = (status) => {
const statusColors = {
      Active: "status-completed",
      Inactive: "status-on-hold", 
      Prospect: "status-in-progress"
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.Active}`}>
        {status}
      </span>
    );
  };
  return (
<Card hover className="p-6">
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => navigate(`/clients/${client.Id}`)}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-gray-600">{client.company}</p>
            {getStatusBadge(client.status)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <ApperIcon name="Mail" size={14} className="mr-2" />
              {client.email}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ApperIcon name="Phone" size={14} className="mr-2" />
              {client.phone}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(client);
            }}
            className="p-2"
          >
            <ApperIcon name="Edit2" size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(client.Id);
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

export default ClientCard;