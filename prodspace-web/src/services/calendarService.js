import { supabase } from '../lib/supabase';

// Fetch todos scheduled for today
export const fetchTodayEvents = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Query for todos that have assigned_time and the range overlaps with today
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .not('assigned_time', 'is', null)
      .overlaps('assigned_time', `[${today} 00:00:00,${tomorrowStr} 00:00:00)`)
      .order('assigned_time', { ascending: true });

    if (error) throw error;
    return { data: todos || [], error: null };
  } catch (error) {
    console.error('Error fetching today events:', error);
    return { data: [], error };
  }
};

// Assign a todo to a specific time slot
export const assignTodoToTime = async (todoId, startTime, durationMinutes) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    // Calculate end time - ensure we're working with local time
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Format as local time strings without timezone info
    const startTimeLocal = startDate.toISOString().slice(0, 19); // Remove timezone info
    const endTimeLocal = endDate.toISOString().slice(0, 19); // Remove timezone info
    
    const assignedTime = `[${startTimeLocal},${endTimeLocal})`;

    console.log('🕐 Creating assigned_time range:', {
      startTime,
      startTimeLocal,
      endTimeLocal,
      assignedTime
    });

    const { data, error } = await supabase
      .from('todos')
      .update({ assigned_time: assignedTime, placed: true })
      .eq('id', todoId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error assigning todo to time:', error);
    return { data: null, error };
  }
};

// Update todo time assignment
export const updateTodoTime = async (todoId, startTime, durationMinutes) => {
  try {
    // Calculate end time - ensure we're working with local time
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Format as local time strings without timezone info
    const startTimeLocal = startDate.toISOString().slice(0, 19); // Remove timezone info
    const endTimeLocal = endDate.toISOString().slice(0, 19); // Remove timezone info
    
    const assignedTime = `[${startTimeLocal},${endTimeLocal})`;

    console.log('🕐 Updating assigned_time range:', {
      startTime,
      startTimeLocal,
      endTimeLocal,
      assignedTime
    });

    const { error } = await supabase
      .from('todos')
      .update({ assigned_time: assignedTime })
      .eq('id', todoId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating todo time:', error);
    return { error };
  }
};

// Remove todo from calendar (clear assigned_time)
export const removeTodoFromCalendar = async (todoId) => {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ assigned_time: null, placed: false })
      .eq('id', todoId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing todo from calendar:', error);
    return { error };
  }
};

// Get unscheduled todos (todos without assigned_time)
export const getUnscheduledTodos = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .is('assigned_time', null);

    if (error) throw error;
    return { data: todos || [], error: null };
  } catch (error) {
    console.error('Error getting unscheduled todos:', error);
    return { data: [], error };
  }
};

// Helper function to extract start time from assigned_time range
export const getStartTimeFromRange = (assignedTime) => {
  if (!assignedTime) return null;
  
  try {
    // Extract start time from range format [start,end)
    const startTime = assignedTime.slice(1, assignedTime.indexOf(','));
    console.log('🔍 Extracting start time from range:', {
      assignedTime,
      startTime,
      rangeStart: assignedTime.slice(1, assignedTime.indexOf(',')),
      rangeEnd: assignedTime.slice(assignedTime.indexOf(',') + 1, -1)
    });
    
    // Validate that the extracted time is valid
    // Add timezone info if missing to ensure proper parsing
    let timeToTest = startTime;
    if (!startTime.includes('Z') && !startTime.includes('+')) {
      timeToTest = startTime + 'Z';
    }
    
    const testDate = new Date(timeToTest);
    if (isNaN(testDate.getTime())) {
      console.error('❌ Invalid start time extracted:', startTime);
      return null;
    }
    
    return startTime;
  } catch (error) {
    console.error('❌ Error extracting start time from range:', error, assignedTime);
    return null;
  }
};

// Helper function to extract duration from assigned_time range
export const getDurationFromRange = (assignedTime) => {
  if (!assignedTime) return 0;
  // Extract start and end times from range format [start,end)
  const startTime = assignedTime.slice(1, assignedTime.indexOf(','));
  const endTime = assignedTime.slice(assignedTime.indexOf(',') + 1, -1);
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return Math.round((end - start) / 60000); // Convert to minutes
};

// Set up real-time subscription for todos
export const subscribeToCalendarEvents = (callback) => {
  const subscription = supabase
    .channel('todos_calendar_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'todos'
      },
      (payload) => {
        console.log('Real-time todos update:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Todos subscription status:', status);
    });

  return subscription;
}; 