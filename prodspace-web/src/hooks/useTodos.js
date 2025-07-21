import { useState, useEffect } from 'react';
import { 
  fetchTodos, 
  addTodo, 
  updateTodoStatus, 
  updateTodoText, 
  deleteTodo, 
  subscribeToTodos 
} from '../services/todoService';

export const useTodos = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const { data: todos, error } = await fetchTodos();
      if (!error) setTasks(todos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
    const subscription = subscribeToTodos(loadTodos);
    return () => subscription.unsubscribe();
  }, []);

  const addTask = async (text, estimate) => {
    const { data: newTask, error } = await addTodo(text, estimate);
    if (!error && newTask) {
      setTasks([newTask, ...tasks]);
    }
    return { success: !error, error };
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: newStatus, completed_at: completedAt } : t
    ));

    const { error } = await updateTodoStatus(id, newStatus, completedAt);
    if (error) {
      // Revert on error
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, status: task.status, completed_at: task.completed_at } : t
      ));
    }
  };

  const removeTask = async (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    
    // Optimistic update
    setTasks(tasks.filter(task => task.id !== id));

    const { error } = await deleteTodo(id);
    if (error && taskToDelete) {
      // Revert on error
      setTasks([...tasks, taskToDelete]);
    }
  };

  const editTask = async (id, newText) => {
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) return;

    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));

    const { error } = await updateTodoText(id, newText);
    if (error) {
      // Revert on error
      setTasks(tasks.map(t => t.id === id ? { ...t, text: originalTask.text } : t));
    }
  };

  return {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    removeTask,
    editTask
  };
}; 