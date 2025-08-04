import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, sidebarCollapsed, onToggleCollapse }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
onClick={onMenuClick}
            className="lg:hidden mr-3 p-2"
          >
            <ApperIcon name="Menu" size={20} />
</Button>
          
          {/* Desktop menu toggle - only show when sidebar is collapsed */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center justify-center p-2 hover:bg-gray-100"
            onClick={onToggleCollapse}
            style={{ display: sidebarCollapsed ? 'flex' : 'none' }}
            title="Expand sidebar"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>

          <div className="lg:hidden flex items-center">
            <div className="p-1.5 rounded-lg mr-2" style={{backgroundColor: 'rgba(74, 144, 226, 0.1)'}}>
              <ApperIcon name="Zap" size={16} style={{color: '#4A90E2'}} />
            </div>
            <span className="text-lg font-bold gradient-text">Project Central</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden lg:block text-sm text-gray-600">
            Welcome back to Project Central
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;