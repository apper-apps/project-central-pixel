import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import clientService from "@/services/api/clientService";
import projectService from "@/services/api/projectService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [clients, projects] = await Promise.all([
        clientService.getAll(),
        projectService.getAll()
      ]);
      
      setStats({
        totalClients: clients.length,
        totalProjects: projects.length,
        activeProjects: projects.length // All projects are active in this demo
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Welcome to ClientFlow
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your clients and projects with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon="Briefcase"
          color="green"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon="Clock"
          color="orange"
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started with ClientFlow
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            ClientFlow helps you organize your business by keeping track of your clients 
            and their projects in one place. Start by adding your first client, then 
            create projects to stay organized and productive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              Add your clients with contact information
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              Create projects and assign them to clients
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              Track your business growth
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;