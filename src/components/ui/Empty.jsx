import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "Inbox",
  title = "No data found",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-4 rounded-full">
          <ApperIcon name={icon} size={32} className="text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;