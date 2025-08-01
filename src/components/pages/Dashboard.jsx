import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";
import taskService from "@/services/api/taskService";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import TodaysTasks from "@/components/molecules/TodaysTasks";
import { toast } from "react-toastify";

const Dashboard = () => {
const [stats, setStats] = useState({
    totalActiveClients: 0,
    activeProjects: 0,
    tasksDueToday: 0,
    overdueTasks: 0
});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [clients, projects, tasks] = await Promise.all([
        clientService.getAll(),
        projectService.getAll(),
        taskService.getAll()
      ]);
      
      // Calculate metrics
      const activeClients = clients.filter(client => client.status === "Active").length;
      const activeProjects = projects.filter(project => 
        project.status === "In Progress" || project.status === "Planning"
      ).length;
      
      const today = new Date().toISOString().split('T')[0];
      const tasksDueToday = tasks.filter(task => 
        !task.completed && task.dueDate === today
      ).length;
      
      const overdueTasks = tasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        return new Date(task.dueDate) < new Date(today);
      }).length;
      
      setStats({
        totalActiveClients: activeClients,
        activeProjects,
        tasksDueToday,
        overdueTasks
      });
      
      // Prepare recent activity
      const activities = [];
      
      // Recent clients (last 5)
      const recentClients = [...clients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      recentClients.forEach(client => {
        activities.push({
          id: `client-${client.Id}`,
          type: 'client',
          title: `New client added: ${client.name}`,
          subtitle: client.company,
          date: client.createdAt,
          icon: 'User'
        });
      });
      
      // Recent projects (last 5)
      const recentProjects = [...projects]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      recentProjects.forEach(project => {
        const client = clients.find(c => c.Id === project.clientId);
        activities.push({
          id: `project-${project.Id}`,
          type: 'project',
          title: `New project created: ${project.name}`,
          subtitle: client ? `for ${client.name}` : '',
          date: project.createdAt,
          icon: 'Briefcase'
        });
      });
      
      // Recently completed tasks (last 5)
      const completedTasks = tasks
        .filter(task => task.completed)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      completedTasks.forEach(task => {
        const project = projects.find(p => p.Id === task.projectId);
        activities.push({
          id: `task-${task.Id}`,
          type: 'task',
          title: `Task completed: ${task.name}`,
          subtitle: project ? `in ${project.name}` : '',
          date: task.createdAt,
          icon: 'CheckCircle'
        });
      });
      
      // Sort all activities by date and take top 8
      const sortedActivities = activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);
      
      setRecentActivity(sortedActivities);
      
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your business management</p>
        </div>
        <Loading type="stats" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your business management</p>
        </div>
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }
// Trigger refresh of Today's Tasks when dashboard data changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [stats]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'client': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-green-600 bg-green-100';
      case 'task': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Business Overview
        </h1>
        <p className="text-gray-600 text-lg">
          Track your business metrics and recent activity
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Clients"
          value={stats.totalActiveClients}
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="Briefcase"
          color="green"
        />
        <StatCard
          title="Due Today"
          value={stats.tasksDueToday}
          icon="Clock"
          color="orange"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon="AlertTriangle"
          color="red"
        />
</div>

      {/* Today's Tasks */}
      <div className="mb-8">
        <TodaysTasks key={refreshKey} />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <ApperIcon name="Activity" size={20} className="text-gray-500" />
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="Inbox" size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No recent activity to show</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <ApperIcon name={activity.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  {activity.subtitle && (
                    <p className="text-xs text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(activity.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;