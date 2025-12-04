// teamflow/frontend/src/components/TaskColumn.tsx
import React from 'react';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import TaskCard from './TaskCard';
import type { Task } from '../types';

interface TaskColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  status: 'todo' | 'in-progress' | 'done';
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  color,
  tasks,
  status,
  onEditTask,
  onDeleteTask,
  onDragOver,
  onDrop,
  onDragStart
}) => {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDraggingOver(false);
    onDrop(e, status);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'todo':
        return <FiCircle className="w-5 h-5" />;
      case 'in-progress':
        return <FiClock className="w-5 h-5" />;
      case 'done':
        return <FiCheckCircle className="w-5 h-5" />;
    }
  };

  const getEmptyStateMessage = () => {
    switch (status) {
      case 'todo':
        return {
          title: "No tasks yet",
          subtitle: "Drag a task here or create a new one to get started"
        };
      case 'in-progress':
        return {
          title: "Nothing in progress",
          subtitle: "Drag tasks here when you start working on them"
        };
      case 'done':
        return {
          title: "No completed tasks",
          subtitle: "Tasks you finish will appear here"
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div
      className={`card p-5 min-h-full border-2 transition-all duration-300 ${isDraggingOver
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 scale-[1.02]'
          : 'border-gray-200 dark:border-gray-700'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-gray-100 dark:border-gray-700">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h2
            className="text-lg font-bold"
            style={{ color }}
          >
            {title}
          </h2>
        </div>
        <span
          className="px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: `${color}15`,
            color
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              onDragStart={(e) => onDragStart(e, task._id)}
              className="transform transition-all duration-200"
            >
              <TaskCard
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div
              className="w-16 h-16 rounded-full mb-4 flex items-center justify-center opacity-40"
              style={{ backgroundColor: `${color}15` }}
            >
              <div style={{ color }} className="text-3xl">
                {getStatusIcon()}
              </div>
            </div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {emptyState.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
              {emptyState.subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Drag Drop Indicator */}
      {isDraggingOver && (
        <div
          className="mt-4 p-4 border-2 border-dashed rounded-lg text-center text-sm font-medium transition-all"
          style={{ borderColor: color, color }}
        >
          Drop task here
        </div>
      )}
    </div>
  );
};

export default TaskColumn;