import { toast } from "react-toastify";
import activityService from "./activityService.js";
import React from "react";
import activityService from "@/services/api/activityService";
import { create, getAll, getById, update } from "@/services/api/issueService";
import { create, getAll, getById, update } from "@/services/api/teamMemberService";
import Error from "@/components/ui/Error";

/**
 * File Attachment Service - Manages file attachments with database integration
 * Uses the file_attachment_c table for persistent storage
 * Supports file uploads, downloads, versioning, and associations with tasks/projects/comments
 */
class FileService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    this.tableName = 'file_attachment_c';
  }

  /**
   * Get all file attachments with optional filtering
   * @param {Object} options - Query options
   * @param {string} options.taskId - Filter by task ID
   * @param {string} options.projectId - Filter by project ID  
   * @param {string} options.commentId - Filter by comment ID
   * @param {string} options.fileType - Filter by file type
   * @param {boolean} options.latestOnly - Only return latest versions
   * @returns {Array} File attachments
   */
  async getAll(options = {}) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "file_name_c" } },
          { field: { Name: "file_size_c" } },
          { field: { Name: "file_type_c" } },
          { field: { Name: "url_c" } },
          { field: { Name: "preview_url_c" } },
          { field: { Name: "version_c" } },
          { field: { Name: "is_latest_c" } },
          { field: { Name: "uploaded_at_c" } },
          { field: { Name: "task_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "comment_id_c" } },
          { field: { Name: "uploaded_by_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "uploaded_at_c",
            sorttype: "DESC"
          }
        ],
        where: [],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      // Add filters based on options
      if (options.taskId) {
        params.where.push({
          FieldName: "task_id_c",
          Operator: "EqualTo",
          Values: [parseInt(options.taskId)]
        });
      }

      if (options.projectId) {
        params.where.push({
          FieldName: "project_id_c", 
          Operator: "EqualTo",
          Values: [parseInt(options.projectId)]
        });
      }

      if (options.commentId) {
        params.where.push({
          FieldName: "comment_id_c",
          Operator: "EqualTo", 
          Values: [parseInt(options.commentId)]
        });
      }

      if (options.fileType) {
        params.where.push({
          FieldName: "file_type_c",
          Operator: "Contains",
          Values: [options.fileType]
        });
      }

      if (options.latestOnly) {
        params.where.push({
          FieldName: "is_latest_c",
          Operator: "EqualTo",
          Values: [true]
        });
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching file attachments:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error("Failed to fetch file attachments");
      }
      return [];
    }
  }

  /**
   * Get file attachment by ID
   * @param {number} id - File attachment ID
   * @returns {Object|null} File attachment data
   */
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "file_name_c" } },
          { field: { Name: "file_size_c" } },
          { field: { Name: "file_type_c" } },
          { field: { Name: "url_c" } },
          { field: { Name: "preview_url_c" } },
          { field: { Name: "version_c" } },
          { field: { Name: "is_latest_c" } },
          { field: { Name: "uploaded_at_c" } },
          { field: { Name: "task_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "comment_id_c" } },
          { field: { Name: "uploaded_by_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching file attachment with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error("Failed to fetch file attachment");
      }
      return null;
    }
  }

  /**
   * Create new file attachment(s)
   * @param {Object|Array} fileData - File attachment data or array of file data
   * @returns {Array} Created file attachment records
   */
  async create(fileData) {
    try {
      // Ensure we have an array for consistent processing
      const fileArray = Array.isArray(fileData) ? fileData : [fileData];
      
      const params = {
        records: fileArray.map(file => {
          // Only include Updateable fields based on schema
          const record = {
            Name: file.Name || file.file_name_c || 'Untitled File',
            file_name_c: file.file_name_c,
            file_size_c: file.file_size_c,
            file_type_c: file.file_type_c,
            url_c: file.url_c,
            preview_url_c: file.preview_url_c || '',
            version_c: file.version_c || 1,
            is_latest_c: file.is_latest_c !== undefined ? file.is_latest_c : true,
            uploaded_at_c: file.uploaded_at_c || new Date().toISOString()
          };

          // Add lookup field IDs (convert to integers)
          if (file.task_id_c !== undefined && file.task_id_c !== null) {
            record.task_id_c = parseInt(file.task_id_c);
          }
          if (file.project_id_c !== undefined && file.project_id_c !== null) {
            record.project_id_c = parseInt(file.project_id_c);
          }
          if (file.comment_id_c !== undefined && file.comment_id_c !== null) {
            record.comment_id_c = parseInt(file.comment_id_c);
          }
          if (file.uploaded_by_c !== undefined && file.uploaded_by_c !== null) {
            record.uploaded_by_c = parseInt(file.uploaded_by_c);
          }

          // Add tags if provided
          if (file.Tags) {
            record.Tags = file.Tags;
          }

          return record;
        })
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} file attachment records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success(`${successfulRecords.length} file attachment(s) uploaded successfully`);
        }

        return successfulRecords.map(result => result.data);
      }

      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating file attachment:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error("Failed to upload file attachment");
      }
      return [];
    }
  }

  /**
   * Update file attachment(s)
   * @param {number|Array} idOrData - File attachment ID or array of records with IDs
   * @param {Object} updateData - Data to update (when using single ID)
   * @returns {Array} Updated file attachment records
   */
  async update(idOrData, updateData = null) {
    try {
      let recordsToUpdate = [];

      if (Array.isArray(idOrData)) {
        // Bulk update mode
        recordsToUpdate = idOrData.map(record => ({
          Id: record.Id,
          // Only include Updateable fields
          ...(record.Name !== undefined && { Name: record.Name }),
          ...(record.file_name_c !== undefined && { file_name_c: record.file_name_c }),
          ...(record.file_size_c !== undefined && { file_size_c: record.file_size_c }),
          ...(record.file_type_c !== undefined && { file_type_c: record.file_type_c }),
          ...(record.url_c !== undefined && { url_c: record.url_c }),
          ...(record.preview_url_c !== undefined && { preview_url_c: record.preview_url_c }),
          ...(record.version_c !== undefined && { version_c: record.version_c }),
          ...(record.is_latest_c !== undefined && { is_latest_c: record.is_latest_c }),
          ...(record.uploaded_at_c !== undefined && { uploaded_at_c: record.uploaded_at_c }),
          ...(record.task_id_c !== undefined && record.task_id_c !== null && { task_id_c: parseInt(record.task_id_c) }),
          ...(record.project_id_c !== undefined && record.project_id_c !== null && { project_id_c: parseInt(record.project_id_c) }),
          ...(record.comment_id_c !== undefined && record.comment_id_c !== null && { comment_id_c: parseInt(record.comment_id_c) }),
          ...(record.uploaded_by_c !== undefined && record.uploaded_by_c !== null && { uploaded_by_c: parseInt(record.uploaded_by_c) }),
          ...(record.Tags !== undefined && { Tags: record.Tags })
        }));
      } else {
        // Single update mode
        const updateRecord = {
          Id: idOrData,
          // Only include Updateable fields
          ...(updateData.Name !== undefined && { Name: updateData.Name }),
          ...(updateData.file_name_c !== undefined && { file_name_c: updateData.file_name_c }),
          ...(updateData.file_size_c !== undefined && { file_size_c: updateData.file_size_c }),
          ...(updateData.file_type_c !== undefined && { file_type_c: updateData.file_type_c }),
          ...(updateData.url_c !== undefined && { url_c: updateData.url_c }),
          ...(updateData.preview_url_c !== undefined && { preview_url_c: updateData.preview_url_c }),
          ...(updateData.version_c !== undefined && { version_c: updateData.version_c }),
          ...(updateData.is_latest_c !== undefined && { is_latest_c: updateData.is_latest_c }),
          ...(updateData.uploaded_at_c !== undefined && { uploaded_at_c: updateData.uploaded_at_c }),
          ...(updateData.task_id_c !== undefined && updateData.task_id_c !== null && { task_id_c: parseInt(updateData.task_id_c) }),
          ...(updateData.project_id_c !== undefined && updateData.project_id_c !== null && { project_id_c: parseInt(updateData.project_id_c) }),
          ...(updateData.comment_id_c !== undefined && updateData.comment_id_c !== null && { comment_id_c: parseInt(updateData.comment_id_c) }),
          ...(updateData.uploaded_by_c !== undefined && updateData.uploaded_by_c !== null && { uploaded_by_c: parseInt(updateData.uploaded_by_c) }),
          ...(updateData.Tags !== undefined && { Tags: updateData.Tags })
        };
        recordsToUpdate = [updateRecord];
      }

      const params = {
        records: recordsToUpdate
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} file attachment records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success(`${successfulUpdates.length} file attachment(s) updated successfully`);
        }

        return successfulUpdates.map(result => result.data);
      }

      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating file attachment:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error("Failed to update file attachment");
      }
      return [];
    }
  }

  /**
   * Delete file attachment(s)
   * @param {number|Array} ids - File attachment ID(s) to delete
   * @returns {boolean} Success status
   */
  async delete(ids) {
    try {
      const recordIds = Array.isArray(ids) ? ids : [ids];
      
      const params = {
        RecordIds: recordIds.map(id => parseInt(id))
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} file attachment records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} file attachment(s) deleted successfully`);
        }

        return successfulDeletions.length === recordIds.length;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting file attachment:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error(error);
        toast.error("Failed to delete file attachment");
      }
      return false;
    }
  }

  /**
   * Upload file and create attachment record
   * @param {File} file - File object to upload
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Created file attachment record
   */
  async uploadFile(file, metadata = {}) {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Here you would typically upload to your file storage service
      // For now, we'll simulate with a URL
      const fileUrl = URL.createObjectURL(file);

      // Create file attachment record
      const fileData = {
        Name: metadata.name || file.name,
        file_name_c: file.name,
        file_size_c: file.size,
        file_type_c: file.type || this.getFileType(file.name),
        url_c: fileUrl, // In production, this would be the actual uploaded file URL
        preview_url_c: metadata.preview_url_c || '',
        version_c: metadata.version_c || 1,
        is_latest_c: true,
        uploaded_at_c: new Date().toISOString(),
        task_id_c: metadata.task_id_c,
        project_id_c: metadata.project_id_c,
        comment_id_c: metadata.comment_id_c,
        uploaded_by_c: metadata.uploaded_by_c,
        Tags: metadata.tags || ''
      };

      const result = await this.create(fileData);
      return result[0] || null;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      return null;
    }
  }

  /**
   * Get file type from filename
   * @param {string} filename - File name
   * @returns {string} File type
   */
  getFileType(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    const typeMap = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      // Text
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml'
    };
    return typeMap[extension] || 'application/octet-stream';
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file type is image
   * @param {string} fileType - File MIME type
   * @returns {boolean} True if image
   */
  isImage(fileType) {
    return fileType && fileType.startsWith('image/');
  }

  /**
   * Get file icon based on file type
   * @param {string} fileType - File MIME type
   * @returns {string} Icon name
   */
  getFileIcon(fileType) {
    if (!fileType) return 'file';
    
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'music';
    if (fileType.includes('pdf')) return 'file-text';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'sheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'presentation';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return 'archive';
    
    return 'file';
  }
}

// Create and export service instance
const fileService = new FileService();
export default fileService;

const fileService = {
  // Get all files for a specific task or project
  getByTaskId: (taskId) => {
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Valid task ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.taskId === taskId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  getByProjectId: (projectId) => {
    if (!projectId || typeof projectId !== 'number') {
      throw new Error('Valid project ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.projectId === projectId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  getByCommentId: (commentId) => {
    if (!commentId || typeof commentId !== 'number') {
      throw new Error('Valid comment ID is required');
    }
    return Promise.resolve(
      fileAttachments
        .filter(file => file.commentId === commentId)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );
  },

  // Get all files
  getAll: () => {
    return Promise.resolve([...fileAttachments]);
  },

  // Get a specific file by ID
  getById: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid file ID is required');
    }
    const file = fileAttachments.find(f => f.Id === id);
    if (!file) {
      throw new Error('File not found');
    }
    return Promise.resolve({ ...file });
  },

  // Upload a new file
  upload: (fileData) => {
    if (!fileData || typeof fileData !== 'object') {
      throw new Error('Valid file data is required');
    }

    const { taskId, projectId, commentId, file, uploadedBy } = fileData;

    if (!uploadedBy || typeof uploadedBy !== 'number') {
      throw new Error('Uploader ID is required');
    }
    if (!file || !file.name) {
      throw new Error('File object is required');
    }
    if (!taskId && !projectId) {
      throw new Error('Either task ID or project ID is required');
    }

    // Check for existing file with same name for versioning
    const existingFiles = fileAttachments.filter(f => 
      f.fileName === file.name && 
      ((taskId && f.taskId === taskId) || (projectId && f.projectId === projectId))
    );

    const version = existingFiles.length > 0 ? Math.max(...existingFiles.map(f => f.version)) + 1 : 1;

    // Mark previous versions as not latest
    if (existingFiles.length > 0) {
      existingFiles.forEach(f => {
        const index = fileAttachments.findIndex(file => file.Id === f.Id);
        if (index !== -1) {
          fileAttachments[index].isLatest = false;
        }
      });
    }

    // Generate mock URLs (in real app, these would be actual storage URLs)
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const baseFileName = fileName.replace(/\.[^/.]+$/, '');
    
    const newFile = {
      Id: Math.max(...fileAttachments.map(f => f.Id), 0) + 1,
      taskId: taskId || null,
      projectId: projectId || null,
      commentId: commentId || null,
      fileName,
      fileSize: file.size || 0,
      fileType: file.type || 'application/octet-stream',
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      version,
      isLatest: true,
      url: `/uploads/${baseFileName}-v${version}.${fileExtension}`,
      previewUrl: this.canPreview(file.type) ? `/previews/${baseFileName}-v${version}.jpg` : null
    };

    fileAttachments.push(newFile);
    return Promise.resolve({ ...newFile });
  },

  // Delete a file
  delete: (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Valid file ID is required');
    }

    const fileIndex = fileAttachments.findIndex(f => f.Id === id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }

    fileAttachments.splice(fileIndex, 1);
    return Promise.resolve({ success: true });
  },

  // Get file versions
  getVersions: (fileName, taskId = null, projectId = null) => {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Valid file name is required');
    }

    const versions = fileAttachments
      .filter(f => 
        f.fileName === fileName && 
        ((taskId && f.taskId === taskId) || (projectId && f.projectId === projectId))
      )
      .sort((a, b) => b.version - a.version);

    return Promise.resolve(versions.map(v => ({ ...v })));
  },

  // Check if file type can be previewed
  canPreview: (fileType) => {
    const previewableTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ];
    return previewableTypes.includes(fileType);
  },

  // Get file type icon
  getFileIcon: (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (fileType.includes('document') || fileType.includes('word')) return 'FileText';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'FileSpreadsheet';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'Archive';
    if (fileType.includes('video')) return 'Video';
    if (fileType.includes('audio')) return 'Music';
    return 'File';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
};

// Import activity service to track file activities

// Override upload method to track activity
const originalUpload = fileService.upload;
fileService.upload = async (fileData) => {
  const newFile = await originalUpload(fileData);
  
  // Track file upload activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.FILE_UPLOADED,
    userId: newFile.uploadedBy,
    projectId: newFile.projectId,
    taskId: newFile.taskId,
    fileId: newFile.Id,
    description: `uploaded file "${newFile.fileName}"${newFile.taskId ? ' to a task' : ''}${newFile.projectId ? ' in project' : ''}`
  });
  
  return newFile;
};

// Override delete method to track activity
const originalFileDelete = fileService.delete;
fileService.delete = async (id) => {
  const file = await fileService.getById(id);
  await originalFileDelete(id);
  
  // Track file deletion activity
  await activityService.create({
    type: activityService.ACTIVITY_TYPES.FILE_DELETED,
    userId: file.uploadedBy,
    projectId: file.projectId,
    taskId: file.taskId,
    fileId: file.Id,
    description: `deleted file "${file.fileName}"${file.taskId ? ' from a task' : ''}${file.projectId ? ' in project' : ''}`
  });
};
