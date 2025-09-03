import { toast } from 'react-toastify';

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'team_member_c';

// Get all team members
export const getAll = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "department_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "avatar_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "start_date_c" } },
        { field: { Name: "skills_c" } },
        { field: { Name: "current_workload_c" } },
        { field: { Name: "max_capacity_c" } },
        { field: { Name: "completed_tasks_this_month_c" } },
        { field: { Name: "total_tasks_this_month_c" } },
        { field: { Name: "average_task_completion_time_c" } }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching team members:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Get team member by ID
export const getById = async (id) => {
  try {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "department_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "avatar_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "start_date_c" } },
        { field: { Name: "skills_c" } },
        { field: { Name: "current_workload_c" } },
        { field: { Name: "max_capacity_c" } },
        { field: { Name: "completed_tasks_this_month_c" } },
        { field: { Name: "total_tasks_this_month_c" } },
        { field: { Name: "average_task_completion_time_c" } }
      ]
    };
    
    const response = await apperClient.getRecordById(tableName, memberId, params);
    
    if (!response || !response.data) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error(`Error fetching team member with ID ${id}:`, error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Create new team member
export const create = async (memberData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: memberData.Name || '',
        Tags: memberData.Tags || '',
        email_c: memberData.email_c || '',
        role_c: memberData.role_c || '',
        department_c: memberData.department_c || '',
        status_c: memberData.status_c || 'Active',
        avatar_c: memberData.avatar_c || '',
        phone_c: memberData.phone_c || '',
        location_c: memberData.location_c || '',
        start_date_c: memberData.start_date_c || '',
        skills_c: memberData.skills_c || '',
        current_workload_c: memberData.current_workload_c || 0,
        max_capacity_c: memberData.max_capacity_c || 40,
        completed_tasks_this_month_c: memberData.completed_tasks_this_month_c || 0,
        total_tasks_this_month_c: memberData.total_tasks_this_month_c || 0,
        average_task_completion_time_c: memberData.average_task_completion_time_c || 0.0
      }]
    };
    
    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create team members ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error creating team member:", error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Update team member
export const update = async (id, memberData) => {
  try {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    // Only include Updateable fields
    const params = {
      records: [{
        Id: memberId,
        Name: memberData.Name,
        Tags: memberData.Tags,
        email_c: memberData.email_c,
        role_c: memberData.role_c,
        department_c: memberData.department_c,
        status_c: memberData.status_c,
        avatar_c: memberData.avatar_c,
        phone_c: memberData.phone_c,
        location_c: memberData.location_c,
        start_date_c: memberData.start_date_c,
        skills_c: memberData.skills_c,
        current_workload_c: memberData.current_workload_c,
        max_capacity_c: memberData.max_capacity_c,
        completed_tasks_this_month_c: memberData.completed_tasks_this_month_c,
        total_tasks_this_month_c: memberData.total_tasks_this_month_c,
        average_task_completion_time_c: memberData.average_task_completion_time_c
      }]
    };
    
    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update team members ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error updating team member:", error.response.data.message);
    } else {
      console.error(error);
    }
    return null;
  }
};

// Delete team member
export const deleteById = async (id) => {
  try {
    const memberId = parseInt(id);
    if (isNaN(memberId)) {
      throw new Error('Invalid team member ID');
    }
    
    const params = {
      RecordIds: [memberId]
    };
    
    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete team members ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      return successfulDeletions.length > 0;
    }
    
    return false;
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error deleting team member:", error.response.data.message);
    } else {
      console.error(error);
    }
    return false;
  }
};

// Get team members by status
export const getByStatus = async (status) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "department_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "avatar_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "start_date_c" } },
        { field: { Name: "skills_c" } },
        { field: { Name: "current_workload_c" } },
        { field: { Name: "max_capacity_c" } }
      ],
      where: [
        {
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: [status]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching team members by status:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Get team members by department
export const getByDepartment = async (department) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "department_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "avatar_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "start_date_c" } },
        { field: { Name: "skills_c" } },
        { field: { Name: "current_workload_c" } },
        { field: { Name: "max_capacity_c" } }
      ],
      where: [
        {
          FieldName: "department_c",
          Operator: "EqualTo",
          Values: [department]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error fetching team members by department:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Search team members
export const search = async (query) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "department_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "avatar_c" } },
        { field: { Name: "phone_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "start_date_c" } },
        { field: { Name: "skills_c" } }
      ],
      whereGroups: [
        {
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "Name",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "email_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "role_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "department_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            }
          ]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error searching team members:", error.response.data.message);
    } else {
      console.error(error);
    }
    return [];
  }
};

// Get workload statistics
export const getWorkloadStats = async () => {
  try {
    // Get all active members
    const activeParams = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "status_c" } },
        { field: { Name: "current_workload_c" } },
        { field: { Name: "max_capacity_c" } }
      ],
      where: [
        {
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: ["Active"]
        }
      ]
    };
    
    // Get total count
    const totalParams = {
      fields: [
        { field: { Name: "Id" } }
      ]
    };
    
    const [activeResponse, totalResponse] = await Promise.all([
      apperClient.fetchRecords(tableName, activeParams),
      apperClient.fetchRecords(tableName, totalParams)
    ]);
    
    if (!activeResponse.success || !totalResponse.success) {
      console.error("Error fetching workload statistics");
      return {
        totalMembers: 0,
        activeMembers: 0,
        averageWorkload: 0,
        capacityUtilization: 0,
        overloadedMembers: 0
      };
    }
    
    const activeMembers = activeResponse.data || [];
    const totalMembers = totalResponse.data || [];
    
    const totalCapacity = activeMembers.reduce((sum, member) => sum + (member.max_capacity_c || 0), 0);
    const totalWorkload = activeMembers.reduce((sum, member) => sum + (member.current_workload_c || 0), 0);
    const overloadedMembers = activeMembers.filter(member => 
      (member.current_workload_c || 0) > (member.max_capacity_c || 0)
    ).length;
    
    return {
      totalMembers: totalMembers.length,
      activeMembers: activeMembers.length,
      averageWorkload: activeMembers.length > 0 ? Math.round(totalWorkload / activeMembers.length) : 0,
      capacityUtilization: totalCapacity > 0 ? Math.round((totalWorkload / totalCapacity) * 100) : 0,
      overloadedMembers: overloadedMembers
    };
  } catch (error) {
    if (error?.response?.data?.message) {
      console.error("Error calculating workload statistics:", error.response.data.message);
    } else {
      console.error(error);
    }
    return {
      totalMembers: 0,
      activeMembers: 0,
      averageWorkload: 0,
      capacityUtilization: 0,
      overloadedMembers: 0
    };
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: deleteById,
  getByStatus,
  getByDepartment,
  search,
  getWorkloadStats
};