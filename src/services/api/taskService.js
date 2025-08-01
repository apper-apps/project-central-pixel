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
          dueDate: taskData.dueDate || null
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
          tasks[index] = { ...tasks[index], ...taskData };
          resolve({ ...tasks[index] });
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
  }
};

export default taskService;