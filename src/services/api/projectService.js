class ProjectService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project_c';
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
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "deliverables_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "chat_enabled_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "client_id_c" } }
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
        console.error("Error fetching projects:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getById(id) {
    // Validate project ID
    if (!id || id === null || id === undefined || id === '') {
      throw new Error("Valid project ID is required");
    }
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error("Valid project ID is required");
    }
    
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
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "deliverables_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "chat_enabled_c" } },
          { field: { Name: "start_date_c" } },
          { field: { Name: "client_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, numericId, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching project with ID ${id}:`, error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async create(projectData) {
    try {
      const params = {
        records: [{
          Name: projectData.Name || projectData.name,
          Tags: projectData.Tags || '',
          description_c: projectData.description_c || projectData.description,
          status_c: projectData.status_c || projectData.status || "Planning",
          deadline_c: projectData.deadline_c || projectData.deadline,
          deliverables_c: projectData.deliverables_c || projectData.deliverables,
          created_at_c: new Date().toISOString(),
          chat_enabled_c: projectData.chat_enabled_c !== undefined ? projectData.chat_enabled_c : (projectData.chatEnabled !== undefined ? projectData.chatEnabled : true),
          start_date_c: projectData.start_date_c || projectData.startDate,
          client_id_c: projectData.client_id_c ? parseInt(projectData.client_id_c) : (projectData.clientId ? parseInt(projectData.clientId) : null)
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
          console.error(`Failed to create projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating project:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, projectData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: projectData.Name || projectData.name,
          Tags: projectData.Tags || projectData.tags,
          description_c: projectData.description_c || projectData.description,
          status_c: projectData.status_c || projectData.status,
          deadline_c: projectData.deadline_c || projectData.deadline,
          deliverables_c: projectData.deliverables_c || projectData.deliverables,
          chat_enabled_c: projectData.chat_enabled_c !== undefined ? projectData.chat_enabled_c : projectData.chatEnabled,
          start_date_c: projectData.start_date_c || projectData.startDate,
          client_id_c: projectData.client_id_c ? parseInt(projectData.client_id_c) : (projectData.clientId ? parseInt(projectData.clientId) : null)
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
          console.error(`Failed to update projects ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating project:", error.response.data.message);
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
          console.error(`Failed to delete Projects ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  // Milestone operations - these would need a separate milestone table
  // For now keeping them as placeholder methods
  async getMilestonesByProjectId(projectId) {
    // This would need to query a separate milestone table
    return [];
  }

  async createMilestone(projectId, milestoneData) {
    // This would need to create in a separate milestone table
    throw new Error("Milestone creation not yet implemented with database");
  }

  async updateMilestone(milestoneId, milestoneData) {
    // This would need to update in a separate milestone table
    throw new Error("Milestone update not yet implemented with database");
  }

  async deleteMilestone(milestoneId) {
    // This would need to delete from a separate milestone table
    throw new Error("Milestone deletion not yet implemented with database");
  }

  // Wiki document operations - these would need a separate wiki table
  async getWikiDocuments(projectId) {
    // This would need to query a separate wiki table
    return [];
  }

  async createWikiDocument(projectId, docData) {
    // This would need to create in a separate wiki table
    throw new Error("Wiki document creation not yet implemented with database");
  }

  async updateWikiDocument(docId, docData) {
    // This would need to update in a separate wiki table
    throw new Error("Wiki document update not yet implemented with database");
  }

  async deleteWikiDocument(docId) {
    // This would need to delete from a separate wiki table
    throw new Error("Wiki document deletion not yet implemented with database");
  }

  // Calendar event operations - these would need a separate calendar table
  async getCalendarEvents(projectId) {
    // This would need to query a separate calendar table
    return [];
  }

  async createCalendarEvent(projectId, eventData) {
    // This would need to create in a separate calendar table
    throw new Error("Calendar event creation not yet implemented with database");
  }

  async updateCalendarEvent(eventId, eventData) {
    // This would need to update in a separate calendar table
    throw new Error("Calendar event update not yet implemented with database");
  }

  async deleteCalendarEvent(eventId) {
    // This would need to delete from a separate calendar table
    throw new Error("Calendar event deletion not yet implemented with database");
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProjectService();