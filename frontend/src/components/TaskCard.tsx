// teamflow/frontend/src/components/TaskCard.tsx
import React, { useState } from 'react';
import { FiClock, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-amber-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getPriorityBgGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-amber-500 to-amber-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.ceil((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-200 dark:border-red-800' };
    if (diffDays === 0) return { status: 'today', text: 'Due today', color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-200 dark:border-amber-800' };
    if (diffDays <= 2) return { status: 'soon', text: 'Due soon', color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-200 dark:border-blue-800' };
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
      className={`group card p-4 mb-3 cursor-grab border-l-4 ${getPriorityColor(task.priority)} 
        transition-all duration-300 ease-out
        hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
        ${isHovered ? 'ring-2 ring-primary-500/20' : ''}
      `}
      draggable
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-bold leading-snug flex-1 text-gray-900 dark:text-white">
          {task.title}
        </h3>
        <div className="flex gap-1.5 ml-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-r ${getPriorityBgGradient(task.priority)} shadow-sm`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Due Date Status Badge */}
      {dueDateStatus && (
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${dueDateStatus.color}`}>
            <FiClock className="w-3.5 h-3.5" />
            {dueDateStatus.text}
          </span>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <div
          className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3"
          dangerouslySetInnerHTML={{ __html: formatDescription(task.description) }}
        />
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <>
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md
                  ${task.assignee.isOnline ? 'ring-2 ring-green-400' : ''}
                `}
              >
                {task.assignee.name.charAt(0).toUpperCase()}
                {task.assignee.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {task.assignee.name}
                </span>
                {task.assignee.isOnline && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                    Online
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
                <FiUser className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Unassigned
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {task.dueDate && !dueDateStatus && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-lg border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 mr-1">
              <FiClock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg transition-all duration-200 hover:scale-110"
            title="Edit task"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110"
            title="Delete task"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;