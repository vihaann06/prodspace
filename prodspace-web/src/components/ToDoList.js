import React, { useState } from 'react';
import { Plus, Check, X, Clock, BarChart3, Calendar } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';

const ToDoList = () => {
  const { tasks, isLoading, addTask, toggleTask, removeTask, editTask } = useTodos();
  const [input, setInput] = useState('');
  const [estimate, setEstimate] = useState('');
  const [filter, setFilter] = useState('all');
  const [showStats, setShowStats] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const { success } = await addTask(input, estimate);
    if (success) {
      setInput('');
      setEstimate('');
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active': return task.status === 'pending';
      case 'completed': return task.status === 'completed';
      default: return true;
    }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    active: tasks.filter(t => t.status === 'pending').length,
    totalEstimate: tasks.filter(t => t.status === 'pending' && t.estimate).reduce((sum, t) => sum + t.estimate, 0)
  };

  const TaskItem = ({ task }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (editText.trim()) {
        await editTask(task.id, editText.trim());
        setIsEditing(false);
      }
    };

    const handleEditCancel = () => {
      setEditText(task.text);
      setIsEditing(false);
    };

    return (
      <li className={`group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 transition-all duration-300 hover:shadow-lg ${task.status === 'completed' ? 'opacity-60' : ''}`}>
        <div className="flex items-center p-4">
          <button
            onClick={() => toggleTask(task.id)}
            className="relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200"
            style={{
              backgroundColor: task.status === 'completed' ? '#6ee7b7' : 'transparent',
              borderColor: task.status === 'completed' ? '#6ee7b7' : '#6b7280',
              '--tw-ring-color': '#6ee7b7'
            }}
          >
            {task.status === 'completed' && (
              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </button>

          <div className="flex-1 mx-4">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 focus:outline-none transition-all"
                  style={{
                    borderColor: '#6b7280',
                    '--tw-ring-color': '#6ee7b7'
                  }}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit(e)}
                />
                <button onClick={handleEditSubmit} style={{ color: '#6ee7b7' }} className="hover:opacity-80">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleEditCancel} style={{ color: '#f87171' }} className="hover:opacity-80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span
                className={`text-lg cursor-pointer transition-all ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                }`}
                style={{ color: task.status === 'completed' ? '#6b7280' : '#ffffff' }}
                onClick={() => task.status !== 'completed' && setIsEditing(true)}
              >
                {task.text}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.estimate && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: '#6ee7b7', backgroundColor: 'rgba(110, 231, 183, 0.1)' }}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{task.estimate}m</span>
              </div>
            )}
            <button
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#f87171' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>
            Today's Tasks
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          style={{ color: '#6ee7b7' }}
        >
          <BarChart3 className="w-5 h-5" />
        </button>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6ee7b7' }}>{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6ee7b7' }}>{stats.completed}</div>
            <div className="text-xs text-gray-400">Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6ee7b7' }}>{stats.active}</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6ee7b7' }}>{stats.totalEstimate}</div>
            <div className="text-xs text-gray-400">Minutes</div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none transition-all"
            style={{
              borderColor: '#6b7280',
              '--tw-ring-color': '#6ee7b7'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask(e)}
          />
          <input
            type="number"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            placeholder="Min"
            min="1"
            max="480"
            className="w-20 bg-gray-800 text-white px-3 py-3 rounded-xl border border-gray-600 focus:outline-none transition-all text-center"
            style={{
              borderColor: '#6b7280',
              '--tw-ring-color': '#6ee7b7'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask(e)}
          />
          <button
            onClick={handleAddTask}
            className="px-6 py-3 text-gray-800 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(to right, #6ee7b7, #34d399)',
              '--tw-ring-color': '#6ee7b7'
            }}
            disabled={!input.trim()}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === filterType ? 'text-gray-800' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            style={{
              backgroundColor: filter === filterType ? '#6ee7b7' : '#1f2937'
            }}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mb-6 scrollbar-hide">
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {filter === 'all' 
                  ? "No tasks yet. Add one above!" 
                  : `No ${filter} tasks.`}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          )}
        </div>
      </div>
            
      {tasks.length > 0 && (
        <div className="mt-auto p-4 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium" style={{ color: '#6ee7b7' }}>
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(stats.completed / stats.total) * 100}%`,
                background: 'linear-gradient(to right, #6ee7b7, #34d399)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ToDoList;