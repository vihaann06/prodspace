import React, { useState, useEffect } from 'react';
import { Plus, Target, X, Check, RotateCcw } from 'lucide-react';
import { fetchHabits, addHabit, deleteHabit, subscribeToHabits, trackHabit, recordRelapse, getHabitStats, getHabitTrackingHistory } from '../services/habitService';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitStats, setHabitStats] = useState({});
  const [habitTrackingHistory, setHabitTrackingHistory] = useState({});

  // Load habits from Supabase
  useEffect(() => {
    loadHabits();
    
    // Set up real-time subscription
    const subscription = subscribeToHabits(() => {
      loadHabits();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const { data: habitsData, error } = await fetchHabits();
      
      if (error) {
        console.error('Error loading habits:', error);
        return;
      }
      
      setHabits(habitsData);
      
      // Load stats and tracking history for each habit
      const stats = {};
      const trackingHistory = {};
      for (const habit of habitsData) {
        const { data: habitStat } = await getHabitStats(habit.id);
        if (habitStat) {
          stats[habit.id] = habitStat;
        }
        
        const { data: history } = await getHabitTrackingHistory(habit.id);
        if (history) {
          trackingHistory[habit.id] = history;
        }
      }
      setHabitStats(stats);
      setHabitTrackingHistory(trackingHistory);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (habitData) => {
    try {
      const { data: newHabit, error } = await addHabit(habitData);
      
      if (error) {
        console.error('Error adding habit:', error);
        return;
      }
      
      // Add to local state for immediate UI update
      if (newHabit) {
        setHabits([newHabit, ...habits]);
        // Add initial stats
        setHabitStats(prev => ({
          ...prev,
          [newHabit.id]: {
            currentStreak: 0,
            longestStreak: 0,
            daysSinceStart: 0,
            lastTrackedDate: null,
            lastRelapseDate: null
          }
        }));
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const handleTrackHabit = async (habitId) => {
    try {
      const { error } = await trackHabit(habitId);
      
      if (error) {
        console.error('Error tracking habit:', error);
        return;
      }
      
      // Reload habits to get updated data
      await loadHabits();
    } catch (error) {
      console.error('Error tracking habit:', error);
    }
  };

  const handleRelapse = async (habitId) => {
    try {
      const { error } = await recordRelapse(habitId);
      
      if (error) {
        console.error('Error recording relapse:', error);
        return;
      }
      
      // Reload habits to get updated data
      await loadHabits();
    } catch (error) {
      console.error('Error recording relapse:', error);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      const { error } = await deleteHabit(id);
      
      if (error) {
        console.error('Error deleting habit:', error);
        return;
      }
      
      // Remove from local state
      setHabits(habits.filter(habit => habit.id !== id));
      setHabitStats(prev => {
        const newStats = { ...prev };
        delete newStats[id];
        return newStats;
      });
      setShowHabitModal(false);
      setSelectedHabit(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const openHabitDetails = (habit) => {
    setSelectedHabit(habit);
    setShowHabitModal(true);
  };

  const isTrackedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.last_tracked_date === today;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col ml-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>
          Habit Tracker
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Build and maintain good habits
        </p>
      </div>

      {/* Habits Grid */}
      <div className="flex-1 overflow-y-auto pr-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Habit Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-48 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:border-gray-500 transition-all duration-200 flex flex-col items-center justify-center group"
          >
            <Plus className="w-12 h-12 text-gray-400 group-hover:text-gray-300 transition-colors" />
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors mt-2">
              Add New Habit
            </p>
          </button>

          {/* Habit Cards */}
          {habits.map((habit) => {
            const stats = habitStats[habit.id] || {};
            const trackedToday = isTrackedToday(habit);
            
            return (
              <div
                key={habit.id}
                onClick={() => openHabitDetails(habit)}
                className="h-48 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 p-4 text-left group cursor-pointer"
              >
                <div className="flex h-full">
                  {/* Left Side - Streak/Clean Days */}
                  <div className="flex flex-col justify-center items-center w-20 mr-4">
                    {habit.habit_type === 'starting' ? (
                      <div className="text-center">
                        <div className="text-6xl font-bold" style={{ color: '#6ee7b7' }}>
                          {stats.currentStreak || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          days
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl font-bold" style={{ color: '#6ee7b7' }}>
                          {stats.daysSinceStart || 0}
                        </div>
                        <div className="text-xs text-gray-400">
                          days
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" style={{ color: '#6ee7b7' }} />
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          habit.habit_type === 'starting' 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {habit.habit_type === 'starting' ? 'Starting' : 'Quitting'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-gray-200 transition-colors line-clamp-1">
                      {habit.name}
                    </h3>
                    
                    {/* Description */}
                    {habit.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {habit.description}
                      </p>
                    )}
                    
                    {/* Frequency */}
                    <div className="text-xs text-gray-500 mb-3">
                      {habit.frequency}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 mt-auto">
                      {habit.habit_type === 'starting' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackHabit(habit.id);
                          }}
                          disabled={trackedToday}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            trackedToday
                              ? 'cursor-not-allowed'
                              : 'hover:opacity-80'
                          }`}
                          style={{
                            background: trackedToday ? '#6ee7b7' : '#6ee7b7',
                            color: '#1f2937'
                          }}
                        >
                          {trackedToday ? 'Done' : 'Mark Done'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRelapse(habit.id);
                          }}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:opacity-80"
                          style={{
                            background: '#6ee7b7',
                            color: '#1f2937'
                          }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddHabit}
        />
      )}

      {/* Habit Details Modal */}
      {showHabitModal && selectedHabit && (
        <HabitDetailsModal
          habit={selectedHabit}
          stats={habitStats[selectedHabit.id] || {}}
          trackingHistory={habitTrackingHistory[selectedHabit.id] || []}
          onClose={() => {
            setShowHabitModal(false);
            setSelectedHabit(null);
          }}
          onDelete={handleDeleteHabit}
          onTrack={handleTrackHabit}
          onRelapse={handleRelapse}
          isTrackedToday={isTrackedToday(selectedHabit)}
        />
      )}
    </div>
  );
};

// Add Habit Modal Component
const AddHabitModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    habit_type: 'starting',
    frequency: 'daily'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ left: '33.333333%' }}>
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Add New Habit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
              style={{ '--tw-ring-color': '#6ee7b7' }}
              placeholder="e.g., Exercise, Read, Quit smoking"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
              style={{ '--tw-ring-color': '#6ee7b7' }}
              placeholder="Describe your habit..."
              rows="3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Habit Type
            </label>
            <select
              value={formData.habit_type}
              onChange={(e) => setFormData({...formData, habit_type: e.target.value})}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
              style={{ '--tw-ring-color': '#6ee7b7' }}
            >
              <option value="starting">Starting a new habit</option>
              <option value="quitting">Quitting a habit</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
              style={{ '--tw-ring-color': '#6ee7b7' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(to right, #6ee7b7, #34d399)',
                color: '#1f2937'
              }}
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Habit Calendar Component
const HabitCalendar = ({ trackedDates, startDate }) => {
  const today = new Date();
  
  // Generate calendar days (last 30 days)
  const days = [];
  const calendarStart = new Date(today);
  calendarStart.setDate(calendarStart.getDate() - 29); // Show last 30 days
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(calendarStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isTracked = trackedDates.includes(dateStr);
    const isToday = dateStr === today.toISOString().split('T')[0];
    
    days.push({
      date: date,
      dateStr: dateStr,
      isTracked: isTracked,
      isToday: isToday
    });
  }

  // Group days by week
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400 mb-3 text-center">
        Last 30 days of tracking
      </div>
      <div className="flex justify-center">
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    day.isTracked
                      ? 'bg-emerald-500 text-gray-800'
                      : day.isToday
                      ? 'border-2 border-emerald-400 text-emerald-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                  title={`${day.date.toLocaleDateString()}${day.isTracked ? ' - Tracked' : ''}`}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Habit Details Modal Component
const HabitDetailsModal = ({ habit, stats, trackingHistory, onClose, onDelete, onTrack, onRelapse, isTrackedToday }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ left: '33.333333%' }}>
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Habit Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" style={{ color: '#6ee7b7' }} />
            <span className={`text-sm px-2 py-1 rounded-full ${
              habit.habit_type === 'starting' 
                ? 'bg-green-900/20 text-green-400' 
                : 'bg-red-900/20 text-red-400'
            }`}>
              {habit.habit_type === 'starting' ? 'Starting' : 'Quitting'}
            </span>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">{habit.name}</h4>
            {habit.description && (
              <p className="text-gray-400 text-sm mb-4">{habit.description}</p>
            )}
          </div>
          
          <div className="text-sm">
            <span className="text-gray-500">Frequency:</span>
            <p className="text-white capitalize">{habit.frequency}</p>
          </div>

          {/* Statistics */}
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <h5 className="text-white font-medium">Tracking Calendar</h5>
            
            {habit.habit_type === 'starting' ? (
              <HabitCalendar 
                trackedDates={trackingHistory} 
                startDate={habit.start_date}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Calendar view for quitting habits coming soon
                </p>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Started:</span>
                <span className="text-white">
                  {new Date(habit.start_date).toLocaleDateString()}
                </span>
              </div>
              {habit.habit_type === 'starting' && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Current Streak:</span>
                  <span className="text-green-400 font-semibold">
                    {stats.currentStreak || 0} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {habit.habit_type === 'starting' ? (
            <button
              onClick={() => {
                onTrack(habit.id);
                onClose();
              }}
              disabled={isTrackedToday}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isTrackedToday
                  ? 'cursor-not-allowed'
                  : 'hover:opacity-80'
              }`}
              style={{
                background: '#6ee7b7',
                color: '#1f2937'
              }}
            >
              {isTrackedToday ? (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  Already Done Today
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 inline mr-2" />
                  Mark as Done Today
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                onRelapse(habit.id);
                onClose();
              }}
              className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: '#6ee7b7',
                color: '#1f2937'
              }}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Reset Counter (Relapse)
            </button>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => onDelete(habit.id)}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker; 