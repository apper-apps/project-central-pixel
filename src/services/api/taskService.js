import mockTasks from "@/services/mockData/tasks.json";

let tasks = [...mockTasks];
let nextId = Math.max(...tasks.map(task => task.Id)) + 1;

const taskService = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...tasks]);
      }, 200);
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const task = tasks.find(t => t.Id === parseInt(id));
        if (task) {
          resolve({ ...task });
        } else {
          reject(new Error("Task not found"));
        }
      }, 100);
    });
  },

create: (taskData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = {
          ...taskData,
          Id: nextId++,
          createdAt: new Date().toISOString(),
          completed: false,
          priority: taskData.priority || "Medium",
          dueDate: taskData.dueDate || null,
          startDate: taskData.startDate || new Date().toISOString(),
          dependencies: taskData.dependencies || [],
          progress: taskData.progress || 0,
          estimatedHours: taskData.estimatedHours || 0,
          actualHours: taskData.actualHours || 0
        };
        tasks.push(newTask);
        resolve({ ...newTask });
      }, 300);
    });
  },

update: (id, taskData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          const updatedTask = { 
            ...tasks[index], 
            ...taskData,
            updatedAt: new Date().toISOString()
          };
          
          // Validate dependencies to prevent circular references
          if (taskData.dependencies) {
            const validateDependencies = (taskId, deps, visited = new Set()) => {
              if (visited.has(taskId)) return false;
              visited.add(taskId);
              
              for (const depId of deps) {
                const depTask = tasks.find(t => t.Id === depId);
                if (depTask && depTask.dependencies) {
                  if (!validateDependencies(depId, depTask.dependencies, visited)) {
                    return false;
                  }
                }
              }
              return true;
            };
            
            if (!validateDependencies(parseInt(id), taskData.dependencies)) {
              reject(new Error("Circular dependency detected"));
              return;
            }
          }
          
          tasks[index] = updatedTask;
          resolve({ ...updatedTask });
        } else {
          reject(new Error("Task not found"));
        }
      }, 300);
    });
  },

delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          tasks.splice(index, 1);
          resolve();
        } else {
          reject(new Error("Task not found"));
        }
      }, 200);
    });
  },

getByProjectId: (projectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const projectTasks = tasks.filter(task => task.projectId === parseInt(projectId));
        resolve([...projectTasks]);
      }, 200);
    });
  },

  markComplete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = tasks.findIndex(t => t.Id === parseInt(id));
        if (index !== -1) {
          tasks[index] = { 
            ...tasks[index], 
            completed: true,
            completedAt: new Date().toISOString()
          };
          resolve({ ...tasks[index] });
        } else {
          reject(new Error("Task not found"));
        }
      }, 300);
    });
  }
};
export default taskService;