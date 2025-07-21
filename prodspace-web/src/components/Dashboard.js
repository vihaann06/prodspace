import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  CalendarIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import ToDoList from './ToDoList';
import PomodoroTimer from './PomodoroTimer';
import HabitTracker from './HabitTracker';
import Calendar from './Calendar';
import { getUnscheduledTodos } from '../services/calendarService';

const Dashboard = ({ onSignOut }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [hasUnscheduledTodos, setHasUnscheduledTodos] = useState(false);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);
  const navigate = useNavigate();

  // Tool definitions
  const tools = [
    {
      id: 'pomodoro',
      name: 'Pomodoro Timer',
      icon: ClockIcon,
      description: 'Stay focused with timed work sessions'
    },
    {
      id: 'todo',
      name: 'To-Do List',
      icon: CheckCircleIcon,
      description: 'Organize and track your tasks'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: CalendarIcon,
      description: 'Schedule and visualize your day'
    },
    {
      id: 'habits',
      name: 'Habit Tracker',
      icon: ArrowPathIcon,
      description: 'Build and maintain good habits'
    }
  ];

  // Load user profile and check for unscheduled todos
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get current user first
        const userResult = await authService.getCurrentUser();
        if (userResult.success && userResult.user) {
          console.log('👤 Loading profile for user:', userResult.user.id);
          console.log('👤 User metadata:', userResult.user.user_metadata);
          console.log('👤 App metadata:', userResult.user.app_metadata);
          
          // Check if user is anonymous - try multiple detection methods
          const isAnonymous = 
            userResult.user.app_metadata?.provider === 'anonymous' ||
            userResult.user.email === null ||
            userResult.user.email === undefined ||
            userResult.user.user_metadata?.provider === 'anonymous';
          
          if (isAnonymous) {
            setIsAnonymousUser(true);
            console.log('👤 Anonymous user detected');
            setUserProfile({
              first_name: 'Guest',
              last_name: '',
              full_name: 'Guest User'
            });
          } else {
            setIsAnonymousUser(false);
            console.log('👤 Regular user detected');
            // Get user profile
            const profileResult = await authService.getUserProfile(userResult.user.id);
            if (profileResult.success) {
              setUserProfile(profileResult.profile);
              console.log('✅ Profile loaded:', profileResult.profile);
            } else {
              console.warn('⚠️ Could not load profile:', profileResult.error);
              // Fallback to auth user data
              setUserProfile({
                first_name: userResult.user.user_metadata?.first_name || 'User',
                last_name: userResult.user.user_metadata?.last_name || '',
                full_name: userResult.user.user_metadata?.full_name || 'User'
              });
            }
          }
        } else {
          setIsAnonymousUser(true);
          console.log('👤 Anonymous user detected.');
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        setUserProfile({ first_name: 'User' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const checkUnscheduledTodos = async () => {
      try {
        const { data: unscheduledTodos } = await getUnscheduledTodos();
        console.log('Unscheduled todos found:', unscheduledTodos?.length || 0);
        setHasUnscheduledTodos(unscheduledTodos && unscheduledTodos.length > 0);
      } catch (error) {
        console.error('Error checking unscheduled todos:', error);
      }
    };

    loadUserProfile();
    checkUnscheduledTodos();

    // Set up interval to check for unscheduled todos
    const interval = setInterval(checkUnscheduledTodos, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/signin');
  };

  // Get display name
  const getDisplayName = () => {
    if (isLoadingProfile) return 'User';
    if (userProfile?.first_name) return userProfile.first_name;
    return 'User';
  };

  // Get current tool
  const getCurrentTool = () => {
    return tools.find(tool => tool.id === selectedTool);
  };

  // Render main content based on selected tool
  const renderMainContent = () => {
    if (!selectedTool) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Let's get started, one day at a time!
            </h1>
            <p className="text-lg text-gray-300">
              Select a tool from the sidebar to begin your productivity journey.
            </p>
          </div>
        </div>
      );
    }

    const currentTool = getCurrentTool();
    if (currentTool.id === 'todo') {
      return <ToDoList />;
    }
    if (currentTool.id === 'pomodoro') {
      return <PomodoroTimer />;
    }
    if (currentTool.id === 'habits') {
      return <HabitTracker />;
    }
    if (currentTool.id === 'calendar') {
      return <Calendar />;
    }
    const IconComponent = currentTool.icon;
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <IconComponent className="w-16 h-16" style={{ color: '#6ee7b7' }} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {currentTool.name}
          </h1>
          <p className="text-lg text-gray-300">
            {currentTool.description}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            This feature is coming soon!
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Main Layout - Full height */}
      <div className="flex h-screen relative">
        {/* Sidebar - extends to full left edge and bottom with header elements */}
        <div className="w-1/3 bg-gray-800 rounded-r-2xl shadow-2xl p-6 relative z-10">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8 ml-4">
            <h1 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>ProdSpace</h1>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl shadow-md transition-colors duration-200"
            >
              {isAnonymousUser ? 'Sign In' : 'Sign Out'}
            </button>
          </div>

          {/* User Greeting */}
          <div className="mb-8 p-4 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Hi {getDisplayName()}!
            </h2>
            <p className="text-gray-300">
              Ready to boost your productivity?
            </p>
          </div>

          {/* Tools Navigation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-4 px-2">
              Your Tools
            </h3>
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 relative ${
                    selectedTool === tool.id
                      ? 'bg-gray-600 border-2 border-gray-500'
                      : 'bg-transparent hover:bg-gray-700 border-2 border-transparent hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`relative ${selectedTool === tool.id ? 'text-white' : 'text-gray-300'}`}>
                      <IconComponent className="w-6 h-6" />
                      {/* Notification dot for calendar */}
                      {tool.id === 'calendar' && hasUnscheduledTodos && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        selectedTool === tool.id 
                          ? 'text-white' 
                          : 'text-white'
                      }`}>
                        {tool.name}
                      </h4>
                      <p className={`text-sm ${
                        selectedTool === tool.id 
                          ? 'text-gray-200' 
                          : 'text-gray-300'
                      }`}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area - extends to full screen width and height with increased overlap */}
        <div className="flex-1 bg-gray-900 rounded-l-2xl shadow-xl p-8 -ml-8 relative z-0">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 