class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "description_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "assigned_to_c" } },
          { field: { Name: "created_by_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "description_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "assigned_to_c" } },
          { field: { Name: "created_by_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async create(taskData) {
    try {
      const params = {
        records: [{
          Name: taskData.Name || taskData.name,
          Tags: taskData.Tags || '',
          description_c: taskData.description_c || taskData.description,
          completed_c: taskData.completed_c || false,
          priority_c: taskData.priority_c || taskData.priority || "Medium",
          start_date_c: taskData.start_date_c || taskData.startDate,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          created_at_c: new Date().toISOString(),
          status_c: taskData.status_c || taskData.status || "pending",
          project_id_c: taskData.project_id_c ? parseInt(taskData.project_id_c) : (taskData.projectId ? parseInt(taskData.projectId) : null),
          assigned_to_c: taskData.assigned_to_c || taskData.assignedTo,
          created_by_c: taskData.created_by_c || taskData.createdBy
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create tasks ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) console.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.Name || taskData.name,
          Tags: taskData.Tags || taskData.tags,
          description_c: taskData.description_c || taskData.description,
          completed_c: taskData.completed_c !== undefined ? taskData.completed_c : taskData.completed,
          priority_c: taskData.priority_c || taskData.priority,
          start_date_c: taskData.start_date_c || taskData.startDate,
          due_date_c: taskData.due_date_c || taskData.dueDate,
          status_c: taskData.status_c || taskData.status,
          project_id_c: taskData.project_id_c ? parseInt(taskData.project_id_c) : (taskData.projectId ? parseInt(taskData.projectId) : null),
          assigned_to_c: taskData.assigned_to_c || taskData.assignedTo,
          created_by_c: taskData.created_by_c || taskData.createdBy
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update tasks ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) console.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete Tasks ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getByProjectId(projectId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "description_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "assigned_to_c" } },
          { field: { Name: "created_by_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching project tasks:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async markComplete(id) {
    return this.update(id, { completed_c: true });
  }

  async updateStatus(id, status) {
    return this.update(id, { status_c: status, completed_c: status === 'completed' });
  }
}

const taskService = new TaskService();
export default taskService;