// teamflow/frontend/src/components/TaskCard.tsx
import React from 'react';
import { FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-amber-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.ceil((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' };
    if (diffDays === 0) return { status: 'today', text: 'Due today', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' };
    if (diffDays <= 2) return { status: 'soon', text: 'Due soon', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' };
    return null;
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);

  const escapeHtml = (unsafe: string) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  const formatDescription = (text: string) => {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div
      className={`card p-4 mb-3 cursor-grab border-l-4 ${getPriorityColor(task.priority)} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
      draggable
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold leading-snug flex-1">
          {task.title}
        </h3>
        <div className="flex gap-2 ml-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getPriorityBgColor(task.priority)}`}>
            {task.priority}
          </span>
          {dueDateStatus && (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${dueDateStatus.color}`}>
              {dueDateStatus.text}
            </span>
          )}
        </div>
      </div>
      
      {task.description && (
        <div
          className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatDescription(task.description) }}
        />
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div 
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              task.assignee 
                ? `bg-primary-500 text-white ${task.assignee.isOnline ? 'ring-2 ring-green-500' : ''}` 
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-medium">
            {task.assignee?.name || 'Unassigned'}
          </span>
        </div>
      
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg border-gray-300 dark:border-gray-600">
              <FiClock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;