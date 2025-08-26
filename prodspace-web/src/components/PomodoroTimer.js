import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { fetchTodayEvents } from '../services/calendarService';

const PomodoroTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [selectedMode, setSelectedMode] = useState('25-5');
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const timerPresets = useMemo(() => ({
    '50-10': { work: 50, break: 10 },
    '25-5': { work: 25, break: 5 },
    'custom': { work: customWork, break: customBreak }
  }), [customWork, customBreak]);

  useEffect(() => {
    const preset = timerPresets[selectedMode];
    setTimeLeft(preset.work * 60);
    setIsWorkTime(true);
    setIsRunning(false);
  }, [selectedMode, customWork, customBreak, timerPresets]);

  useEffect(() => {
    const loadCurrentTask = async () => {
      try {
        const { data: todayEvents, error } = await fetchTodayEvents();
        if (error) {
          console.error('Error fetching today events:', error);
          return;
        }

        if (todayEvents && todayEvents.length > 0) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTimeInMinutes = currentHour * 60 + currentMinute;

          let foundTask = null;
          for (const task of todayEvents) {
            if (task.assigned_time) {
              const timeRange = parseTimeRange(task.assigned_time);
              if (timeRange) {
                const taskStartHour = timeRange.start.getHours();
                const taskStartMinute = timeRange.start.getMinutes();
                const taskStartTimeInMinutes = taskStartHour * 60 + taskStartMinute;
                
                const taskEndHour = timeRange.end.getHours();
                const taskEndMinute = timeRange.end.getMinutes();
                const taskEndTimeInMinutes = taskEndHour * 60 + taskEndMinute;

                if (currentTimeInMinutes >= taskStartTimeInMinutes && currentTimeInMinutes < taskEndTimeInMinutes) {
                  foundTask = task;
                  break;
                }
              }
            }
          }

          setCurrentTask(foundTask);
          console.log('Current task found:', foundTask);
        } else {
          setCurrentTask(null);
        }
      } catch (error) {
        console.error('Error loading current task:', error);
        setCurrentTask(null);
      }
    };

    loadCurrentTask();
    
    const interval = setInterval(loadCurrentTask, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const parseTimeRange = (assignedTime) => {
    if (!assignedTime) return null;
    
    try {
      let startTime, endTime;
      
      const postgresMatch = assignedTime.match(/\["([^"]+)","([^"]+)"\)/);
      if (postgresMatch) {
        startTime = postgresMatch[1];
        endTime = postgresMatch[2];
      } else {
        const isoMatch = assignedTime.match(/\[([^,]+),([^)]+)\)/);
        if (isoMatch) {
          startTime = isoMatch[1];
          endTime = isoMatch[2];
        } else {
          return null;
        }
      }
      
      const cleanStartTime = startTime.includes('T') ? startTime : startTime.replace(' ', 'T');
      const cleanEndTime = endTime.includes('T') ? endTime : endTime.replace(' ', 'T');
      
      const startDate = new Date(cleanStartTime);
      const endDate = new Date(cleanEndTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }
      
      return {
        start: startDate,
        end: endDate
      };
    } catch (error) {
      console.error('Error parsing time range:', error, assignedTime);
      return null;
    }
  };

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    if (isWorkTime) {
      setIsWorkTime(false);
      const preset = timerPresets[selectedMode];
      setTimeLeft(preset.break * 60);
    } else {
      setIsWorkTime(true);
      const preset = timerPresets[selectedMode];
      setTimeLeft(preset.work * 60);
    }
  }, [isWorkTime, timerPresets, selectedMode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const preset = timerPresets[selectedMode];
    setTimeLeft(preset.work * 60);
    setIsWorkTime(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const preset = timerPresets[selectedMode];
    const totalTime = isWorkTime ? preset.work * 60 : preset.break * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleCustomTimeChange = (value, type) => {
    const numValue = parseInt(value) || 0;
    if (type === 'work') {
      setCustomWork(numValue);
    } else {
      setCustomBreak(numValue);
    }
  };

  const saveCustomSettings = () => {
    if (customWork > 0 && customBreak > 0) {
      setSelectedMode('custom');
      setShowCustomModal(false);
    }
  };

  const formatTimeRange = (assignedTime) => {
    const timeRange = parseTimeRange(assignedTime);
    if (!timeRange) return '';
    
    const startTime = timeRange.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = timeRange.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">  
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>
          Pomodoro Timer
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Stay focused with timed work sessions
        </p>
      </div>

      <div className="mb-8">
        <div className="flex gap-3 justify-center mb-4">
          {Object.entries(timerPresets).map(([key, value]) => (
            <button
              key={key}
              onClick={() => key === 'custom' ? setShowCustomModal(true) : setSelectedMode(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMode === key ? 'text-gray-800' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedMode === key ? '#6ee7b7' : '#1f2937'
              }}
            >
              {key === 'custom' ? 'Custom' : `${value.work}-${value.break}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative w-72 h-72 mb-8 -mt-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (getProgressPercentage() / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-lg font-medium" style={{ color: '#6ee7b7' }}>
                {isWorkTime ? 'Work Time' : 'Break Time'}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={toggleTimer}
              className="p-4 rounded-full transition-all duration-200 flex items-center gap-2"
              style={{
                background: 'linear-gradient(to right, #6ee7b7, #34d399)',
                color: '#1f2937'
              }}
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Start
                </>
              )}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center">
            {currentTask ? (
              <div className="bg-gray-700 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-gray-400 text-sm mb-2">Current task on calendar:</p>
                <p className="text-white font-medium text-lg mb-1">{currentTask.text}</p>
                <p className="text-gray-300 text-sm">
                  {currentTask.estimate || 30} min • {formatTimeRange(currentTask.assigned_time)}
                </p>
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-gray-400 text-sm">No current task scheduled</p>
                <p className="text-gray-300 text-xs mt-1">Check your calendar to schedule tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCustomModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Custom Timer Settings</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Work Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customWork || ''}
                  onChange={(e) => handleCustomTimeChange(e.target.value, 'work')}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
                  style={{ '--tw-ring-color': '#6ee7b7' }}
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreak || ''}
                  onChange={(e) => handleCustomTimeChange(e.target.value, 'break')}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
                  style={{ '--tw-ring-color': '#6ee7b7' }}
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomSettings}
                disabled={!customWork || !customBreak}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(to right, #6ee7b7, #34d399)',
                  color: '#1f2937'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" />
      </audio>
    </div>
  );
};

export default PomodoroTimer; 