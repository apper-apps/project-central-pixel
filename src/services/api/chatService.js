import chatMessagesData from '@/services/mockData/chatMessages.json';

class ChatService {
  constructor() {
    this.messages = [...chatMessagesData];
  }

  // Simulate network delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay(300);
    return [...this.messages];
  }

  async getById(id) {
    await this.delay(200);
    const message = this.messages.find(m => m.Id === parseInt(id));
    if (!message) {
      throw new Error("Message not found");
    }
    return { ...message };
  }

  async getMessagesByChannel(projectId = null, channelType = 'team') {
    await this.delay(300);
    return this.messages
      .filter(message => {
        if (channelType === 'team') {
          return message.channelType === 'team';
        } else if (channelType === 'project' && projectId) {
          return message.channelType === 'project' && message.projectId === parseInt(projectId);
        }
        return false;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(message => ({ ...message }));
  }

  async create(messageData) {
    await this.delay(400);
    const newId = this.messages.length > 0 ? Math.max(...this.messages.map(m => m.Id)) + 1 : 1;
    const newMessage = {
      Id: newId,
      content: messageData.content,
      authorId: parseInt(messageData.authorId),
      projectId: messageData.projectId ? parseInt(messageData.projectId) : null,
      channelType: messageData.channelType || 'team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.messages.push(newMessage);
    return { ...newMessage };
  }

  async update(id, messageData) {
    await this.delay(400);
    const index = this.messages.findIndex(m => m.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Message not found");
    }
    
    this.messages[index] = {
      ...this.messages[index],
      content: messageData.content,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.messages[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.messages.findIndex(m => m.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Message not found");
    }
    
    this.messages.splice(index, 1);
    return { success: true };
  }
}

export default new ChatService();