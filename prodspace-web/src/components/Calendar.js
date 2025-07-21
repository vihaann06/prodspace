import React, { useEffect, useRef, useState } from 'react';
import { fetchTodos } from '../services/todoService';
import { assignTodoToTime, fetchTodayEvents, updateTodoTime } from '../services/calendarService';

const START_HOUR = 6; // 6 AM
const END_HOUR = 22; // 10 PM
const HOUR_HEIGHT = 60; // px per hour
const TIMELINE_HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

const Calendar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unplacedTodos, setUnplacedTodos] = useState([]);
  const [placedTodos, setPlacedTodos] = useState([]);
  const [draggedTodo, setDraggedTodo] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const timelineRef = useRef(null);

  // Fetch unplaced and placed todos
  useEffect(() => {
    const loadTodos = async () => {
      const { data, error } = await fetchTodos();
      if (!error) {
        const todos = data || [];
        setUnplacedTodos(todos.filter(todo => !todo.placed));
        setPlacedTodos(todos.filter(todo => todo.placed));
      }
    };
    loadTodos();
  }, []);

  // Load today's events
  useEffect(() => {
    const loadTodayEvents = async () => {
      const { data, error } = await fetchTodayEvents();
      if (!error) {
        setPlacedTodos(data || []);
      }
    };
    loadTodayEvents();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const update = () => setCurrentTime(new Date());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate position of the red line (current time)
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const minutesSinceStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
    if (minutesSinceStart < 0 || now.getHours() > END_HOUR) return null;
    const position = (minutesSinceStart / 60) * HOUR_HEIGHT;
    console.log('[Calendar] Current time:', now.toLocaleTimeString(), '| Red line position (px):', position);
    return position;
  };

  // Auto-scroll to current time on mount and when current time changes
  useEffect(() => {
    const position = getCurrentTimePosition();
    if (timelineRef.current && position !== null) {
      // Center the red line in the visible area if possible
      const container = timelineRef.current;
      const containerHeight = container.clientHeight;
      const scrollTo = Math.max(0, position - containerHeight / 2);
      container.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
  }, [currentTime]);

  // Format hour label
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  // Calculate height for a todo based on its estimate (duration in minutes)
  const getTodoHeight = (estimate) => {
    const duration = estimate || 30; // default 30 min
    return Math.max((duration / 60) * HOUR_HEIGHT, 32); // at least 32px tall
  };

  // Parse time range from assigned_time
  const parseTimeRange = (assignedTime) => {
    if (!assignedTime) return null;
    
    console.log('🔍 Parsing assigned_time:', assignedTime);
    
    try {
      let startTime, endTime;
      
      // Try to parse PostgreSQL range format: ["2025-07-14 16:00:00","2025-07-14 17:00:00")
      const postgresMatch = assignedTime.match(/\["([^"]+)","([^"]+)"\)/);
      if (postgresMatch) {
        startTime = postgresMatch[1];
        endTime = postgresMatch[2];
        console.log('🔍 Parsed PostgreSQL format:', { startTime, endTime });
      } else {
        // Try to parse ISO format: [2025-07-14T14:00:00,2025-07-14T15:00:00)
        const isoMatch = assignedTime.match(/\[([^,]+),([^)]+)\)/);
        if (isoMatch) {
          startTime = isoMatch[1];
          endTime = isoMatch[2];
          console.log('🔍 Parsed ISO format:', { startTime, endTime });
        } else {
          console.error('❌ No match found for any supported range format:', assignedTime);
          return null;
        }
      }
      
      // Convert space format to ISO format for proper Date parsing if needed
      // "2025-07-14 16:00:00" -> "2025-07-14T16:00:00"
      const cleanStartTime = startTime.includes('T') ? startTime : startTime.replace(' ', 'T');
      const cleanEndTime = endTime.includes('T') ? endTime : endTime.replace(' ', 'T');
      
      console.log('🔍 Clean times:', { cleanStartTime, cleanEndTime });
      
      // Parse as local time directly
      const startDate = new Date(cleanStartTime);
      const endDate = new Date(cleanEndTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('❌ Invalid dates created:', { startDate, endDate, cleanStartTime, cleanEndTime });
        return null;
      }
      
      console.log('✅ Parsed dates:', { 
        startDate: startDate.toLocaleTimeString(), 
        endDate: endDate.toLocaleTimeString()
      });
      
      return {
        start: startDate,
        end: endDate
      };
    } catch (error) {
      console.error('❌ Error parsing time range:', error, assignedTime);
      return null;
    }
  };

  // Calculate position for a placed todo
  const getTodoPosition = (todo) => {
    const timeRange = parseTimeRange(todo.assigned_time);
    if (!timeRange) return null;
    
    const startMinutes = timeRange.start.getHours() * 60 + timeRange.start.getMinutes();
    const timelineStartMinutes = START_HOUR * 60;
    
    // Check if event is within timeline view
    if (startMinutes < timelineStartMinutes || startMinutes >= END_HOUR * 60) {
      return null;
    }
    
    const relativeStartMinutes = startMinutes - timelineStartMinutes;
    const top = (relativeStartMinutes / 60) * HOUR_HEIGHT + 1; // +1 for the 1px padding
    const height = getTodoHeight(todo.estimate);
    
    console.log('📍 Todo positioning:', {
      todoId: todo.id,
      startTime: timeRange.start.toLocaleTimeString(),
      startMinutes,
      timelineStartMinutes,
      relativeStartMinutes,
      calculatedTop: top,
      height
    });
    
    return { top, height };
  };

  // Snap to nearest 30-minute interval
  const snapToInterval = (minutes) => {
    return Math.round(minutes / 30) * 30;
  };

  // Handle drag start
  const handleDragStart = (e, todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', todo.id);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!draggedTodo) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollTop = timelineRef.current.scrollTop;
    
    // Calculate position relative to the timeline content (accounting for scroll)
    const y = e.clientY - rect.top + scrollTop - 270;
    
    // Calculate time from drop position (reverse of getTodoPosition logic)
    // The timeline starts at 6 AM, so we need to account for that offset
    const relativeStartMinutes = (y / HOUR_HEIGHT) * 60;
    const snappedRelativeMinutes = snapToInterval(relativeStartMinutes);
    
    // Convert to actual time by adding timeline start time
    const timelineStartMinutes = START_HOUR * 60; // 6 AM = 360 minutes
    const totalMinutes = timelineStartMinutes + snappedRelativeMinutes;
    const targetHour = Math.floor(totalMinutes / 60);
    const targetMinute = totalMinutes % 60;
    
    // Create start time for today in local time format
    const today = new Date();
    const startTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      targetHour,
      targetMinute,
      0,
      0
    );

    console.log('🎯 Dropping todo:', {
      todoId: draggedTodo.id,
      clientY: e.clientY,
      rectTop: rect.top,
      scrollTop,
      calculatedY: y,
      relativeStartMinutes,
      snappedRelativeMinutes,
      timelineStartMinutes,
      totalMinutes,
      targetHour,
      targetMinute,
      startTime: startTime.toLocaleTimeString(),
      startTimeISO: startTime.toISOString()
    });

    try {
      let updatedTodo;
      
      // Check if this is an existing placed todo being repositioned
      const isRepositioning = placedTodos.some(todo => todo.id === draggedTodo.id);
      
      if (isRepositioning) {
        // Update existing todo's time
        const { data, error } = await updateTodoTime(
          draggedTodo.id,
          startTime.toISOString(),
          draggedTodo.estimate || 30
        );
        
        if (error) {
          console.error('Error updating todo time:', error);
          return;
        }
        
        // Update the placed todos list with the new time
        setPlacedTodos(prev => prev.map(todo => 
          todo.id === draggedTodo.id 
            ? { ...todo, assigned_time: `[${startTime.toISOString().slice(0, 19)},${new Date(startTime.getTime() + (draggedTodo.estimate || 30) * 60000).toISOString().slice(0, 19)})` }
            : todo
        ));
        
        updatedTodo = { ...draggedTodo, assigned_time: `[${startTime.toISOString().slice(0, 19)},${new Date(startTime.getTime() + (draggedTodo.estimate || 30) * 60000).toISOString().slice(0, 19)})` };
      } else {
        // Assign new todo to time
        const { data, error } = await assignTodoToTime(
          draggedTodo.id,
          startTime.toISOString(),
          draggedTodo.estimate || 30
        );

        if (error) {
          console.error('Error assigning todo to calendar:', error);
          return;
        }
        
        updatedTodo = data;

        // Remove from unplaced list and add to placed list
        setUnplacedTodos(prev => prev.filter(todo => todo.id !== draggedTodo.id));
        setPlacedTodos(prev => [...prev, updatedTodo]);
      }
      
      console.log('✅ Todo updated on calendar:', updatedTodo);
    } catch (error) {
      console.error('Error updating todo on calendar:', error);
    } finally {
      setDraggedTodo(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-row gap-8">
      {/* Unplaced To-Dos Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col justify-center ml-8" style={{ minHeight: '400px' }}>
        <div className="flex flex-col gap-4 justify-center h-full">
          {unplacedTodos.length === 0 && (
            <div className="text-gray-500 text-sm text-center">No unplaced tasks</div>
          )}
          {unplacedTodos.map(todo => (
            <div
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, todo)}
              className="rounded-lg px-4 py-3 shadow cursor-move select-none flex items-center justify-between"
              style={{
                height: getTodoHeight(todo.estimate),
                background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
                color: '#1f2937',
                border: '2px solid #6ee7b7',
                fontWeight: 600
              }}
            >
              <span className="truncate">{todo.text}</span>
              <span className="ml-4 text-sm font-bold" style={{ color: '#059669' }}>{todo.estimate || 30} min</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-left" style={{ color: '#6ee7b7' }}>
          Today's Calendar
        </h2>
        <div
          className={`w-full bg-gray-800 rounded-xl border border-gray-700 px-6 relative overflow-y-auto mt-4 transition-colors duration-200 ${
            isDragOver ? 'border-emerald-400 bg-gray-750' : ''
          }`}
          style={{
            maxHeight: '100%',
            minHeight: '400px',
            height: '100%'
          }}
          ref={timelineRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 1 minute padding above 6 AM */}
          <div style={{ height: '1px' }}></div>
          {/* Timeline Hours */}
          {TIMELINE_HOURS.map((hour, idx) => (
            <div
              key={hour}
              className="flex items-center border-b border-gray-700 last:border-b-0 relative"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <div className="w-16 text-sm text-gray-400 font-medium">
                {formatHour(hour)}
              </div>
              <div className="flex-1 h-full relative">
                {/* Hour line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-600"></div>
                {/* 30-minute mark */}
                <div className="absolute left-0 right-0 h-px bg-gray-700" style={{ top: `${HOUR_HEIGHT / 2}px` }}></div>
              </div>
            </div>
          ))}

          {/* Placed Todos */}
          {placedTodos.map(todo => {
            const position = getTodoPosition(todo);
            if (!position) return null;
            
            return (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                className="absolute rounded-lg p-3 cursor-move transition-all duration-200 hover:shadow-lg border border-emerald-300"
                style={{
                  top: `${position.top}px`,
                  height: `${position.height}px`,
                  left: '80px',
                  right: '20px',
                  zIndex: 10,
                  background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
                  color: '#1f2937'
                }}
              >
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{todo.text}</h4>
                    <div className="flex items-center mt-2 text-xs opacity-80">
                      <span>{todo.estimate || 30} min</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current Time Indicator */}
          {getCurrentTimePosition() !== null && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{ top: `${getCurrentTimePosition()}px`, left: 0, right: 0, width: '100%' }}
            >
              <div className="flex items-center">
                {/* Dot at the very left edge, centered on the line */}
                <div className="flex items-center" style={{ width: '0.75rem' }}>
                  <div className="w-3 h-3 bg-red-500 rounded-full" style={{ marginRight: '-0.5rem' }}></div>
                </div>
                {/* Full-width red line */}
                <div className="flex-1 relative">
                  <div className="h-0.5 bg-red-500 w-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;