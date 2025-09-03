class TimeEntryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'time_entry_c';
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
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
        console.error("Error fetching time entries:", error.response.data.message);
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
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
        console.error(`Error fetching time entry with ID ${id}:`, error.response.data.message);
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
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
        console.error("Error fetching project time entries:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  // Get time entries by task ID
  async getByTaskId(taskId) {
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "task_id_c",
            Operator: "EqualTo",
            Values: [parseInt(taskId)]
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
        console.error("Error fetching task time entries:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async create(timeEntryData) {
    try {
      const params = {
        records: [{
          Name: timeEntryData.Name || `Time Entry ${Date.now()}`,
          Tags: timeEntryData.Tags || '',
          description_c: timeEntryData.description_c || timeEntryData.description,
          date_c: timeEntryData.date_c || timeEntryData.date,
          duration_c: parseFloat(timeEntryData.duration_c || timeEntryData.duration),
          created_at_c: new Date().toISOString(),
          project_id_c: timeEntryData.project_id_c ? parseInt(timeEntryData.project_id_c) : (timeEntryData.projectId ? parseInt(timeEntryData.projectId) : null),
          task_id_c: timeEntryData.task_id_c ? parseInt(timeEntryData.task_id_c) : (timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null)
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
          console.error(`Failed to create time entries ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating time entry:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async createFromTimer(timeEntryData) {
    // Specialized method for timer-generated entries
    return this.create(timeEntryData);
  }

  async update(id, timeEntryData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: timeEntryData.Name,
          Tags: timeEntryData.Tags,
          description_c: timeEntryData.description_c || timeEntryData.description,
          date_c: timeEntryData.date_c || timeEntryData.date,
          duration_c: parseFloat(timeEntryData.duration_c || timeEntryData.duration),
          project_id_c: timeEntryData.project_id_c ? parseInt(timeEntryData.project_id_c) : (timeEntryData.projectId ? parseInt(timeEntryData.projectId) : null),
          task_id_c: timeEntryData.task_id_c ? parseInt(timeEntryData.task_id_c) : (timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null)
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
          console.error(`Failed to update time entries ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating time entry:", error.response.data.message);
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
          console.error(`Failed to delete Time Entries ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting time entry:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async bulkDelete(entryIds) {
    try {
      const params = {
        RecordIds: entryIds.map(id => parseInt(id))
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete Time Entries ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.every(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error bulk deleting time entries:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async exportToCSV(entries, projects = []) {
    await this.delay(200);
    
    const projectMap = projects.reduce((acc, project) => {
      acc[project.Id] = project.Name;
      return acc;
    }, {});

    const csvHeaders = ['Date', 'Project', 'Description', 'Duration (hours)', 'Created At'];
    const csvRows = entries.map(entry => [
      entry.date_c || entry.date,
      projectMap[entry.project_id_c || entry.projectId] || 'Unknown Project',
      `"${(entry.description_c || entry.description || '').replace(/"/g, '""')}"`, // Escape quotes
      entry.duration_c || entry.duration,
      entry.created_at_c || entry.createdAt
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `time-entries-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }

  async getTimesByProject(projectId, startDate, endDate) {
    try {
      let params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ]
      };

      if (startDate) {
        params.where.push({
          FieldName: "date_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [startDate]
        });
      }

      if (endDate) {
        params.where.push({
          FieldName: "date_c",
          Operator: "LessThanOrEqualTo",
          Values: [endDate]
        });
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching project times:", error.response.data.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async getTimesByDateRange(startDate, endDate) {
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "date_c",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
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
        console.error("Error fetching time entries by date range:", error.response.data.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async getTimeSummaryByProject() {
    try {
      const entries = await this.getAll();
      
      const summary = entries.reduce((acc, entry) => {
        const projectId = entry.project_id_c || entry.projectId;
        if (!acc[projectId]) {
          acc[projectId] = {
            projectId,
            totalHours: 0,
            totalEntries: 0,
            dates: []
          };
        }
        
        acc[projectId].totalHours += entry.duration_c || entry.duration;
        acc[projectId].totalEntries += 1;
        acc[projectId].dates.push(entry.date_c || entry.date);
        
        return acc;
      }, {});

      // Get unique dates and sort them
      Object.values(summary).forEach(project => {
        project.dates = [...new Set(project.dates)].sort();
        project.totalHours = Math.round(project.totalHours * 100) / 100;
      });

      return Object.values(summary);
    } catch (error) {
      console.error("Error getting time summary:", error);
      return [];
    }
  }

  async searchEntries(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAll();
      }
      
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
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "task_id_c" } }
        ],
        where: [
          {
            FieldName: "description_c",
            Operator: "Contains",
            Values: [searchTerm.toLowerCase()]
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
        console.error("Error searching time entries:", error.response.data.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TimeEntryService();