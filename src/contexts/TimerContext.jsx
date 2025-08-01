import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import timeEntryService from '@/services/api/timeEntryService';
import projectService from '@/services/api/projectService';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  
  const intervalRef = useRef(null);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projectService.getAll();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };
    loadProjects();
  }, []);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setIsRunning(state.isRunning || false);
        setIsPaused(state.isPaused || false);
        setDuration(state.duration || 0);
        setSelectedProjectId(state.selectedProjectId || null);
        setDescription(state.description || '');
        setStartTime(state.startTime ? new Date(state.startTime) : null);
        setIsWidgetVisible(state.isWidgetVisible || false);
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      isRunning,
      isPaused,
      duration,
      selectedProjectId,
      description,
      startTime: startTime?.toISOString(),
      isWidgetVisible
    };
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [isRunning, isPaused, duration, selectedProjectId, description, startTime, isWidgetVisible]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const startTimer = (projectId, desc = '') => {
    if (!projectId) {
      toast.error('Please select a project to start timing');
      return;
    }

    const project = projects.find(p => p.Id === parseInt(projectId));
    if (!project) {
      toast.error('Selected project not found');
      return;
    }

    setSelectedProjectId(parseInt(projectId));
    setDescription(desc);
    setStartTime(new Date());
    setDuration(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsWidgetVisible(true);
    
    toast.success(`Timer started for ${project.name}`);
  };

  const pauseTimer = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      toast.info('Timer paused');
    }
  };

  const resumeTimer = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      toast.info('Timer resumed');
    }
  };

  const stopTimer = async () => {
    if (!isRunning || duration === 0) {
      resetTimer();
      return;
    }

    try {
      const project = projects.find(p => p.Id === selectedProjectId);
      const durationInHours = duration / 3600; // Convert seconds to hours
      
      const timeEntryData = {
        projectId: selectedProjectId,
        description: description || `Work on ${project?.name || 'Unknown Project'}`,
        date: new Date().toISOString().split('T')[0],
        duration: Math.round(durationInHours * 100) / 100 // Round to 2 decimal places
      };

      await timeEntryService.createFromTimer(timeEntryData);
      
      const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      toast.success(`Time logged: ${formatDuration(duration)} for ${project?.name}`);
      resetTimer();
    } catch (error) {
      console.error('Failed to save time entry:', error);
      toast.error('Failed to save time entry. Timer data preserved.');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setDuration(0);
    setSelectedProjectId(null);
    setDescription('');
    setStartTime(null);
    setIsWidgetVisible(false);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    // State
    isRunning,
    isPaused,
    duration,
    selectedProjectId,
    description,
    startTime,
    projects,
    isWidgetVisible,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setDescription,
    setIsWidgetVisible,
    
    // Utils
    formatDuration
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};