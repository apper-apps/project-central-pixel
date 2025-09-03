class ChatService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'chat_message_c';
    this.reactions = [];
    this.channels = [
      { Id: 1, name: 'Team Chat', type: 'team', projectId: null, createdAt: new Date().toISOString(), memberCount: 5 },
      { Id: 2, name: 'E-commerce Platform', type: 'project', projectId: 1, createdAt: new Date().toISOString(), memberCount: 3 },
      { Id: 3, name: 'Mobile App Dev', type: 'project', projectId: 2, createdAt: new Date().toISOString(), memberCount: 2 },
      { Id: 4, name: 'Marketing Website', type: 'project', projectId: 3, createdAt: new Date().toISOString(), memberCount: 2 }
    ];
    this.nextChannelId = 5;
  }

  // Simulate network delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
          { field: { Name: "content_c" } },
          { field: { Name: "channel_type_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "author_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "parent_id_c" } }
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
        console.error("Error fetching chat messages:", error.response.data.message);
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
          { field: { Name: "content_c" } },
          { field: { Name: "channel_type_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "author_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "parent_id_c" } }
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
        console.error(`Error fetching chat message with ID ${id}:`, error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getChannelsByType(channelType = 'team') {
    await this.delay(200);
    return this.channels.filter(channel => channel.type === channelType);
  }

  async createChannel(channelData) {
    await this.delay(300);
    const newChannel = {
      Id: this.nextChannelId++,
      name: channelData.name,
      type: channelData.type || 'team',
      projectId: channelData.projectId || null,
      description: channelData.description || '',
      createdAt: new Date().toISOString(),
      memberCount: 1
    };
    this.channels.push(newChannel);
    return newChannel;
  }

  async getMessagesByChannel(projectId = null, channelType = 'team') {
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
          { field: { Name: "content_c" } },
          { field: { Name: "channel_type_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "author_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "parent_id_c" } }
        ],
        orderBy: [
          {
            fieldName: "created_at_c",
            sorttype: "ASC"
          }
        ]
      };

      if (channelType === 'team') {
        params.where = [
          {
            FieldName: "channel_type_c",
            Operator: "EqualTo",
            Values: ["team"]
          }
        ];
      } else if (channelType === 'project' && projectId) {
        params.where = [
          {
            FieldName: "channel_type_c",
            Operator: "EqualTo", 
            Values: ["project"]
          },
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const messages = response.data || [];
      
      // Add reactions and thread counts to messages
      return messages.map(message => ({
        ...message,
        reactions: this.getMessageReactions(message.Id),
        threadCount: this.getThreadCount(message.Id),
        hasThread: this.hasThread(message.Id)
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching channel messages:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async create(messageData) {
    try {
      const params = {
        records: [{
          Name: messageData.Name || `Message ${Date.now()}`,
          Tags: messageData.Tags || '',
          content_c: messageData.content_c || messageData.content,
          channel_type_c: messageData.channel_type_c || messageData.channelType || 'team',
          created_at_c: new Date().toISOString(),
          updated_at_c: new Date().toISOString(),
          author_id_c: messageData.author_id_c || messageData.authorId,
          project_id_c: messageData.project_id_c ? parseInt(messageData.project_id_c) : (messageData.projectId ? parseInt(messageData.projectId) : null),
          parent_id_c: messageData.parent_id_c ? parseInt(messageData.parent_id_c) : (messageData.parentId ? parseInt(messageData.parentId) : null)
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
          console.error(`Failed to create chat messages ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating chat message:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, messageData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: messageData.Name,
          Tags: messageData.Tags,
          content_c: messageData.content_c || messageData.content,
          channel_type_c: messageData.channel_type_c || messageData.channelType,
          updated_at_c: new Date().toISOString(),
          author_id_c: messageData.author_id_c || messageData.authorId,
          project_id_c: messageData.project_id_c ? parseInt(messageData.project_id_c) : (messageData.projectId ? parseInt(messageData.projectId) : null),
          parent_id_c: messageData.parent_id_c ? parseInt(messageData.parent_id_c) : (messageData.parentId ? parseInt(messageData.parentId) : null)
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
          console.error(`Failed to update chat messages ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating chat message:", error.response.data.message);
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
          console.error(`Failed to delete Chat Messages ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting chat message:", error.response.data.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  // Slack-like thread functionality
  async getThreadReplies(parentId) {
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
          { field: { Name: "content_c" } },
          { field: { Name: "channel_type_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "updated_at_c" } },
          { field: { Name: "author_id_c" } },
          { field: { Name: "project_id_c" } },
          { field: { Name: "parent_id_c" } }
        ],
        where: [
          {
            FieldName: "parent_id_c",
            Operator: "EqualTo",
            Values: [parseInt(parentId)]
          }
        ],
        orderBy: [
          {
            fieldName: "created_at_c",
            sorttype: "ASC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const messages = response.data || [];
      
      return messages.map(message => ({
        ...message,
        reactions: this.getMessageReactions(message.Id)
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching thread replies:", error.response.data.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  getThreadCount(messageId) {
    // This would need to be implemented with a database query in real implementation
    // For now returning 0 as placeholder
    return 0;
  }

  hasThread(messageId) {
    return this.getThreadCount(messageId) > 0;
  }

  async addMemberToChannel(channelId, memberId) {
    await this.delay(200);
    const channel = this.channels.find(c => c.Id === parseInt(channelId));
    if (channel) {
      channel.memberCount = (channel.memberCount || 0) + 1;
      return true;
    }
    return false;
  }

  // Emoji reactions (keeping in memory for now as no table defined)
  async addReaction(messageId, emoji, userId) {
    await this.delay(200);
    const reaction = {
      Id: Date.now(),
      messageId: parseInt(messageId),
      emoji,
      userId: parseInt(userId),
      createdAt: new Date().toISOString()
    };
    this.reactions.push(reaction);
    return reaction;
  }

  async removeReaction(messageId, emoji, userId) {
    await this.delay(200);
    const index = this.reactions.findIndex(r => 
      r.messageId === parseInt(messageId) && 
      r.emoji === emoji && 
      r.userId === parseInt(userId)
    );
    if (index !== -1) {
      this.reactions.splice(index, 1);
    }
    return { success: true };
  }

  getMessageReactions(messageId) {
    const messageReactions = this.reactions.filter(r => r.messageId === parseInt(messageId));
    const grouped = {};
    
    messageReactions.forEach(reaction => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.userId);
    });
    
    return Object.values(grouped);
  }

  // Mention extraction
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  // Search functionality
  async searchMessages(query, channelType = 'team', projectId = null) {
    try {
      const messages = await this.getMessagesByChannel(projectId, channelType);
      return messages.filter(message => 
        message.content_c?.toLowerCase().includes(query.toLowerCase()) ||
        (message.mentions && message.mentions.some(mention => 
          mention.toLowerCase().includes(query.toLowerCase())
        ))
      );
    } catch (error) {
      console.error("Error searching messages:", error);
      return [];
    }
  }

  // File attachment handling
  async uploadFile(file, messageId) {
    await this.delay(500);
    const attachment = {
      Id: Date.now(),
      messageId: parseInt(messageId),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: URL.createObjectURL(file), // In production, this would be a real URL
      uploadedAt: new Date().toISOString()
    };
    return attachment;
  }
}
export default new ChatService();