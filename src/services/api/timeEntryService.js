import timeEntriesData from "@/services/mockData/timeEntries.json";

class TimeEntryService {
  constructor() {
    this.timeEntries = [...timeEntriesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.timeEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await this.delay(200);
    const timeEntry = this.timeEntries.find(entry => entry.Id === parseInt(id));
    if (!timeEntry) {
      throw new Error("Time entry not found");
    }
    return { ...timeEntry };
  }

  async getByProjectId(projectId) {
    await this.delay(200);
    return this.timeEntries
      .filter(entry => entry.projectId === parseInt(projectId))
      .map(entry => ({ ...entry }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

async create(timeEntryData) {
    await this.delay(400);
    const newId = this.timeEntries.length > 0 ? Math.max(...this.timeEntries.map(entry => entry.Id)) + 1 : 1;
    const newTimeEntry = {
      Id: newId,
...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration),
      createdAt: new Date().toISOString()
    };
    this.timeEntries.push(newTimeEntry);
    return { ...newTimeEntry };
  }

  async createFromTimer(timeEntryData) {
    // Specialized method for timer-generated entries (no delay for better UX)
    const newId = this.timeEntries.length > 0 ? Math.max(...this.timeEntries.map(entry => entry.Id)) + 1 : 1;
    const newTimeEntry = {
      Id: newId,
...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration),
      createdAt: new Date().toISOString()
    };
    this.timeEntries.push(newTimeEntry);
    return { ...newTimeEntry };
  }

  async update(id, timeEntryData) {
    await this.delay(400);
    const index = this.timeEntries.findIndex(entry => entry.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
this.timeEntries[index] = {
      ...this.timeEntries[index],
      ...timeEntryData,
      projectId: parseInt(timeEntryData.projectId),
      taskId: timeEntryData.taskId ? parseInt(timeEntryData.taskId) : null,
      duration: parseFloat(timeEntryData.duration)
    };
    
    return { ...this.timeEntries[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.timeEntries.findIndex(entry => entry.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
    this.timeEntries.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TimeEntryService();