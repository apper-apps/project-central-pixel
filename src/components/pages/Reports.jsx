import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import reportService from '@/services/api/reportService';
import Chart from 'react-apexcharts';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ projects: [], teamMembers: [] });
  const [filters, setFilters] = useState({
    projectId: '',
    teamMemberId: '',
    startDate: '',
    endDate: ''
  });
  
  // Report data states
  const [projectStatusData, setProjectStatusData] = useState(null);
  const [teamPerformanceData, setTeamPerformanceData] = useState(null);
  const [timeTrackingData, setTimeTrackingData] = useState(null);
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Reload data when filters change
  useEffect(() => {
    if (!loading) {
      loadReportsData();
    }
  }, [filters]);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options = await reportService.getFilterOptions();
      setFilterOptions(options);
      
      await loadReportsData();
    } catch (err) {
      setError('Failed to load reports data');
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadReportsData = async () => {
    try {
      const [projectStatus, teamPerformance, timeTracking] = await Promise.all([
        reportService.getProjectStatusData(filters),
        reportService.getTeamPerformanceData(filters),
        reportService.getTimeTrackingData(filters)
      ]);
      
      setProjectStatusData(projectStatus);
      setTeamPerformanceData(teamPerformance);
      setTimeTrackingData(timeTracking);
    } catch (err) {
      console.error('Error loading reports:', err);
      toast.error('Failed to refresh reports data');
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      projectId: '',
      teamMemberId: '',
      startDate: '',
      endDate: ''
    });
  };
  
  // Chart configurations
  const getProjectStatusPieConfig = () => {
    if (!projectStatusData?.statusDistribution) return null;
    
    const statuses = Object.keys(projectStatusData.statusDistribution);
    const values = Object.values(projectStatusData.statusDistribution);
    
    return {
      series: values,
      options: {
        chart: { type: 'pie' },
        labels: statuses,
        colors: ['#4A90E2', '#4CAF50', '#F1C40F', '#C0392B', '#9E9E9E'],
        legend: { position: 'bottom' },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: { width: 320 },
            legend: { position: 'bottom' }
          }
        }]
      }
    };
  };
  
  const getProjectProgressBarConfig = () => {
    if (!projectStatusData?.projectProgress) return null;
    
    const data = projectStatusData.projectProgress;
    
    return {
      series: [{
        name: 'Progress %',
        data: data.map(p => p.progress)
      }],
      options: {
        chart: { type: 'bar' },
        xaxis: { categories: data.map(p => p.name) },
        yaxis: { max: 100 },
        colors: ['#4A90E2'],
        plotOptions: {
          bar: { horizontal: false, columnWidth: '55%' }
        }
      }
    };
  };
  
  const getTeamCompletionLineConfig = () => {
    if (!teamPerformanceData?.completionTrends) return null;
    
    const data = teamPerformanceData.completionTrends;
    
    return {
      series: [{
        name: 'Tasks Completed',
        data: data.map(d => ({ x: d.date, y: d.completed }))
      }],
      options: {
        chart: { type: 'line' },
        stroke: { curve: 'smooth' },
        colors: ['#4CAF50'],
        xaxis: { type: 'datetime' }
      }
    };
  };
  
  const getTeamTasksBarConfig = () => {
    if (!teamPerformanceData?.memberPerformance) return null;
    
    const data = teamPerformanceData.memberPerformance;
    
    return {
      series: [{
        name: 'Completed Tasks',
        data: data.map(m => m.completed)
      }, {
        name: 'Total Tasks',
        data: data.map(m => m.total)
      }],
      options: {
        chart: { type: 'bar' },
        xaxis: { categories: data.map(m => m.name) },
        colors: ['#4CAF50', '#4A90E2']
      }
    };
  };
  
  const getTimeTrackingStackedConfig = () => {
    if (!timeTrackingData?.timeByProject) return null;
    
    const data = timeTrackingData.timeByProject;
    if (data.length === 0) return null;
    
    // Get all unique team members
    const allMembers = new Set();
    data.forEach(project => {
      Object.keys(project).forEach(key => {
        if (key !== 'project') allMembers.add(key);
      });
    });
    
    const series = Array.from(allMembers).map(member => ({
      name: member,
      data: data.map(project => project[member] || 0)
    }));
    
    return {
      series,
      options: {
        chart: { type: 'bar', stacked: true },
        xaxis: { categories: data.map(p => p.project) },
        colors: ['#4A90E2', '#4CAF50', '#F1C40F', '#C0392B', '#9E9E9E']
      }
    };
  };
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your projects and team performance</p>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {filterOptions.projects.map(project => (
                <option key={project.Id} value={project.Id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <select
              value={filters.teamMemberId}
              onChange={(e) => handleFilterChange('teamMemberId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Team Members</option>
              {filterOptions.teamMembers.map(member => (
                <option key={member.Id} value={member.Id}>{member.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <Button variant="outline" onClick={clearFilters}>
            <ApperIcon name="X" size={16} />
            Clear
          </Button>
        </div>
      </Card>
      
      {/* Project Status Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ApperIcon name="PieChart" size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Project Status Report</h2>
            <p className="text-gray-600">High-level overview of all projects</p>
          </div>
        </div>
        
        {projectStatusData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Status Distribution</h3>
              {getProjectStatusPieConfig() && (
                <Chart
                  options={getProjectStatusPieConfig().options}
                  series={getProjectStatusPieConfig().series}
                  type="pie"
                  height={300}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Project Progress</h3>
              {getProjectProgressBarConfig() && (
                <Chart
                  options={getProjectProgressBarConfig().options}
                  series={getProjectProgressBarConfig().series}
                  type="bar"
                  height={300}
                />
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* Team Performance Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ApperIcon name="TrendingUp" size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Performance Report</h2>
            <p className="text-gray-600">Team workloads and task completion rates</p>
          </div>
        </div>
        
        {teamPerformanceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Task Completion Trends</h3>
              {getTeamCompletionLineConfig() && (
                <Chart
                  options={getTeamCompletionLineConfig().options}
                  series={getTeamCompletionLineConfig().series}
                  type="line"
                  height={300}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Tasks by Team Member</h3>
              {getTeamTasksBarConfig() && (
                <Chart
                  options={getTeamTasksBarConfig().options}
                  series={getTeamTasksBarConfig().series}
                  type="bar"
                  height={300}
                />
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* Time Tracking Report */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ApperIcon name="Clock" size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Time Tracking Report</h2>
            <p className="text-gray-600">Detailed report of all logged time</p>
          </div>
        </div>
        
        {timeTrackingData && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Hours by Team Member & Project</h3>
              <div className="text-sm text-gray-600">
                Total: {timeTrackingData.totalHours} hours ({timeTrackingData.totalEntries} entries)
              </div>
            </div>
            {getTimeTrackingStackedConfig() && (
              <Chart
                options={getTimeTrackingStackedConfig().options}
                series={getTimeTrackingStackedConfig().series}
                type="bar"
                height={400}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}