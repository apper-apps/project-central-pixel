import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Clients", href: "/clients", icon: "Users" },
    { name: "Projects", href: "/projects", icon: "Briefcase" }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto gradient-bg">
          <div className="flex items-center flex-shrink-0 px-6">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ApperIcon name="Zap" size={24} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">ClientFlow</span>
            </div>
          </div>
          <nav className="mt-8 flex-1 px-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white bg-opacity-20 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                    }`
                  }
                >
                  <ApperIcon 
                    name={item.icon} 
                    size={20} 
                    className="mr-3 flex-shrink-0" 
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full gradient-bg">
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-4">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ApperIcon name="Zap" size={24} className="text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">ClientFlow</span>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white bg-opacity-20 text-white shadow-lg"
                        : "text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                    }`
                  }
                >
                  <ApperIcon 
                    name={item.icon} 
                    size={20} 
                    className="mr-3 flex-shrink-0" 
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;