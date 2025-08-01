import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry,
  title = "Error"
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 p-3 rounded-full">
          <ApperIcon name="AlertCircle" size={24} className="text-red-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;