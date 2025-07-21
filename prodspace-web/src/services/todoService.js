import { supabase } from '../lib/supabase';

// Fetch all todos for the current user
export const fetchTodos = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: todos || [], error: null };
  } catch (error) {
    console.error('Error fetching todos:', error);
    return { data: [], error };
  }
};

// Add a new todo
export const addTodo = async (text, estimate = null) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    const newTask = {
      user_id: user.id,
      text: text.trim(),
      estimate: estimate ? parseInt(estimate) : null,
      status: 'pending',
      placed: false // explicitly set placed to false
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([newTask])
      .select();

    if (error) throw error;
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Error adding todo:', error);
    return { data: null, error };
  }
};

// Update todo status (toggle complete/pending)
export const updateTodoStatus = async (id, status, completedAt = null) => {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ 
        status,
        completed_at: completedAt
      })
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating todo status:', error);
    return { error };
  }
};

// Update todo text
export const updateTodoText = async (id, text) => {
  try {
    const { error } = await supabase
      .from('todos')
      .update({ text })
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating todo text:', error);
    return { error };
  }
};

// Delete a todo
export const deleteTodo = async (id) => {
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { error };
  }
};

// Set up real-time subscription for todos
export const subscribeToTodos = (callback) => {
  const subscription = supabase
    .channel('todos_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'todos'
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