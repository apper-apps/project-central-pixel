import projectsData from "@/services/mockData/projects.json";

class ProjectService {
  constructor() {
    this.projects = [...projectsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.projects];
  }

  async getById(id) {
    await this.delay(200);
    const project = this.projects.find(p => p.Id === parseInt(id));
    if (!project) {
      throw new Error("Project not found");
    }
    return { ...project };
  }

async create(projectData) {
    await this.delay(400);
    const newId = this.projects.length > 0 ? Math.max(...this.projects.map(p => p.Id)) + 1 : 1;
    const newProject = {
      Id: newId,
      ...projectData,
      clientId: parseInt(projectData.clientId),
      status: projectData.status || "Planning",
      deadline: projectData.deadline || "",
      deliverables: projectData.deliverables || "",
      milestones: [],
      createdAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    return { ...newProject };
  }

  async update(id, projectData) {
    await this.delay(400);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    this.projects[index] = {
      ...this.projects[index],
      ...projectData,
      clientId: parseInt(projectData.clientId),
      status: projectData.status || this.projects[index].status,
      deadline: projectData.deadline || this.projects[index].deadline,
      deliverables: projectData.deliverables || this.projects[index].deliverables
    };
    
    return { ...this.projects[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    this.projects.splice(index, 1);
    return true;
  }

  // Milestone operations
  async getMilestonesByProjectId(projectId) {
    await this.delay(200);
    const project = this.projects.find(p => p.Id === parseInt(projectId));
    if (!project) {
      throw new Error("Project not found");
    }
    return project.milestones ? [...project.milestones] : [];
  }

  async createMilestone(projectId, milestoneData) {
    await this.delay(300);
    const projectIndex = this.projects.findIndex(p => p.Id === parseInt(projectId));
    if (projectIndex === -1) {
      throw new Error("Project not found");
    }

    if (!this.projects[projectIndex].milestones) {
      this.projects[projectIndex].milestones = [];
    }

    const allMilestones = this.projects.flatMap(p => p.milestones || []);
    const newId = allMilestones.length > 0 ? Math.max(...allMilestones.map(m => m.Id)) + 1 : 1;
    
    const newMilestone = {
      Id: newId,
      projectId: parseInt(projectId),
      title: milestoneData.title,
      description: milestoneData.description || "",
      dueDate: milestoneData.dueDate,
      isCompleted: false,
      completedDate: null,
      createdAt: new Date().toISOString()
    };

    this.projects[projectIndex].milestones.push(newMilestone);
    return { ...newMilestone };
  }

  async updateMilestone(milestoneId, milestoneData) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.milestones) {
        const milestoneIndex = project.milestones.findIndex(m => m.Id === parseInt(milestoneId));
        if (milestoneIndex !== -1) {
          project.milestones[milestoneIndex] = {
            ...project.milestones[milestoneIndex],
            ...milestoneData
          };
          return { ...project.milestones[milestoneIndex] };
        }
      }
    }
    
    throw new Error("Milestone not found");
  }

  async deleteMilestone(milestoneId) {
    await this.delay(300);
    
    for (let project of this.projects) {
      if (project.milestones) {
        const milestoneIndex = project.milestones.findIndex(m => m.Id === parseInt(milestoneId));
        if (milestoneIndex !== -1) {
          project.milestones.splice(milestoneIndex, 1);
          return true;
        }
      }
    }
    
    throw new Error("Milestone not found");
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProjectService();