import { supabase } from '../lib/supabase';

export const fetchTodayEvents = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

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

export const assignTodoToTime = async (todoId, startTime, durationMinutes) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const startTimeLocal = startDate.toISOString().slice(0, 19);
    const endTimeLocal = endDate.toISOString().slice(0, 19);
    
    const assignedTime = `[${startTimeLocal},${endTimeLocal})`;

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

export const updateTodoTime = async (todoId, startTime, durationMinutes) => {
  try {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const startTimeLocal = startDate.toISOString().slice(0, 19);
    const endTimeLocal = endDate.toISOString().slice(0, 19);
    
    const assignedTime = `[${startTimeLocal},${endTimeLocal})`;

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

export const getStartTimeFromRange = (assignedTime) => {
  if (!assignedTime) return null;
  
  try {
    const startTime = assignedTime.slice(1, assignedTime.indexOf(','));
    
    let timeToTest = startTime;
    if (!startTime.includes('Z') && !startTime.includes('+')) {
      timeToTest = startTime + 'Z';
    }
    
    const testDate = new Date(timeToTest);
    if (isNaN(testDate.getTime())) {
      return null;
    }
    
    return startTime;
  } catch (error) {
    return null;
  }
};

export const getDurationFromRange = (assignedTime) => {
  if (!assignedTime) return 0;
  const startTime = assignedTime.slice(1, assignedTime.indexOf(','));
  const endTime = assignedTime.slice(assignedTime.indexOf(',') + 1, -1);
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return Math.round((end - start) / 60000);
};

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
        callback();
      }
    )
    .subscribe((status) => {
    });

  return subscription;
}; 