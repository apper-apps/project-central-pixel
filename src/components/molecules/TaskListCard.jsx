import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import TaskCard from "@/components/molecules/TaskCard";

const TaskListCard = ({ 
  taskList, 
  tasks, 
  project,
  onEdit, 
  onDelete, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskComplete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const taskListTasks = tasks.filter(task => 
    taskList.tasks.includes(task.Id)
  );

  const completedTasks = taskListTasks.filter(task => task.completed).length;
  const totalTasks = taskListTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
<Card hover className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-auto"
            >
              <ApperIcon 
                name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                size={16} 
className="text-gray-400"
              />
            </Button>
<h4 className="font-medium text-gray-100 truncate">
              {taskList.name}
            </h4>
<span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0" style={{backgroundColor: 'rgba(74, 144, 226, 0.2)', color: '#4A90E2', borderColor: 'rgba(74, 144, 226, 0.3)', border: '1px solid'}}>
              {totalTasks} tasks
            </span>
          </div>
          
          {taskList.description && (
<p className="text-sm text-gray-300 mb-2 line-clamp-2 ml-6">
              {taskList.description}
            </p>
          )}
          
          {totalTasks > 0 && (
            <div className="ml-6 mb-2">
              <div className="flex items-center gap-2 mb-1">
<span className="text-xs text-gray-400">Progress:</span>
                <span className="text-xs font-medium text-gray-100">{completionRate}%</span>
              </div>
<div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%`, backgroundColor: '#4A90E2' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(taskList)}
            className="p-1.5"
            title="Add Task"
          >
<ApperIcon name="Plus" size={14} className="text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(taskList)}
            className="p-1.5"
            title="Edit Task List"
          >
<ApperIcon name="Edit2" size={14} className="text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(taskList.Id)}
className="p-1.5 text-red-400 hover:text-red-300"
            title="Delete Task List"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      {isExpanded && (
<div className="ml-6 space-y-3 border-l-2 border-gray-700 pl-4">
          {taskListTasks.length === 0 ? (
            <div className="text-center py-4">
<ApperIcon name="CheckSquare" size={24} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-2">No tasks in this list yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTask(taskList)}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={14} />
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {taskListTasks.map((task) => (
<div key={task.Id} className="border border-gray-700 rounded-lg">
                  <TaskCard
                    task={task}
                    project={project}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onToggleComplete={onToggleTaskComplete}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TaskListCard;