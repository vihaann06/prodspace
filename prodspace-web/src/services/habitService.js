import { supabase } from '../lib/supabase';

// Fetch all habits for the current user
export const fetchHabits = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: habits || [], error: null };
  } catch (error) {
    console.error('Error fetching habits:', error);
    return { data: [], error };
  }
};

// Add a new habit
export const addHabit = async (habitData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const newHabit = {
      user_id: user.id,
      name: habitData.name,
      description: habitData.description || null,
      habit_type: habitData.habit_type,
      frequency: habitData.frequency || 'daily',
      current_streak: 0,
      longest_streak: 0,
      last_tracked_date: null,
      start_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([newHabit])
      .select();

    if (error) throw error;
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error adding habit:', error);
    return { data: null, error };
  }
};

// Track a habit for today (for starting habits)
export const trackHabit = async (habitId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const today = new Date().toISOString().split('T')[0];
    
    // Get current habit data
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (fetchError) throw fetchError;

    let newStreak = habit.current_streak || 0;
    let newLongestStreak = habit.longest_streak || 0;

    // Check if already tracked today
    if (habit.last_tracked_date === today) {
      return { error: 'Already tracked for today' };
    }

    // Check if this is consecutive (yesterday was tracked)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (habit.last_tracked_date === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak if not consecutive
    }

    // Update longest streak if current streak is longer
    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }

    // Update habit
    const { error } = await supabase
      .from('habits')
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_tracked_date: today
      })
      .eq('id', habitId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error tracking habit:', error);
    return { error };
  }
};

// Record a relapse for quitting habits
export const recordRelapse = async (habitId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const now = new Date().toISOString();
    
    // Get current habit data
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (fetchError) throw fetchError;

    // Reset the streak and update last relapse timestamp
    const { error } = await supabase
      .from('habits')
      .update({
        current_streak: 0,
        last_relapse_date: now
      })
      .eq('id', habitId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error recording relapse:', error);
    return { error };
  }
};

// Get habit statistics
export const getHabitStats = async (habitId) => {
  try {
    const { data: habit, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) throw error;

    const startDate = new Date(habit.start_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    // Calculate time since last relapse for quitting habits
    let timeSinceRelapse = null;
    if (habit.habit_type === 'quitting' && habit.last_relapse_date) {
      const lastRelapse = new Date(habit.last_relapse_date);
      const timeDiff = today - lastRelapse;
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      timeSinceRelapse = { days, hours, minutes };
    }

    return {
      data: {
        currentStreak: habit.current_streak || 0,
        longestStreak: habit.longest_streak || 0,
        daysSinceStart,
        lastTrackedDate: habit.last_tracked_date,
        lastRelapseDate: habit.last_relapse_date,
        timeSinceRelapse
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting habit stats:', error);
    return { data: null, error };
  }
};

// Get habit tracking history for calendar view
export const getHabitTrackingHistory = async (habitId) => {
  try {
    const { data: habit, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) throw error;

    // For now, we'll use the last_tracked_date to create a simple tracking history
    // In a more complete implementation, you'd have a separate tracking_logs table
    const trackedDates = [];
    
    if (habit.last_tracked_date) {
      // For starting habits, we can estimate tracked dates based on streak
      if (habit.habit_type === 'starting' && habit.current_streak > 0) {
        const lastTracked = new Date(habit.last_tracked_date);
        for (let i = 0; i < habit.current_streak; i++) {
          const date = new Date(lastTracked);
          date.setDate(date.getDate() - i);
          trackedDates.push(date.toISOString().split('T')[0]);
        }
      } else {
        // Add the last tracked date
        trackedDates.push(habit.last_tracked_date);
      }
    }

    return {
      data: trackedDates,
      error: null
    };
  } catch (error) {
    console.error('Error getting habit tracking history:', error);
    return { data: [], error };
  }
};

// Update a habit
export const updateHabit = async (id, updates) => {
  try {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating habit:', error);
    return { error };
  }
};

// Delete a habit (hard delete from database)
export const deleteHabit = async (id) => {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting habit:', error);
    return { error };
  }
};

// Set up real-time subscription for habits
export const subscribeToHabits = (callback) => {
  const subscription = supabase
    .channel('habits_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'habits'
      },
      (payload) => {
        console.log('Real-time update:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return subscription;
}; 