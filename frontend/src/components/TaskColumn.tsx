// teamflow/frontend/src/components/TaskColumn.tsx
import React from 'react';
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
  return (
    <div
      className="card p-4 min-h-full border border-gray-200 dark:border-gray-700"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <h2 
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        {title} 
        <span className="ml-auto px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
          {tasks.length}
        </span>
      </h2>
      
      {tasks.map((task) => (
        <div
          key={task._id}
          onDragStart={(e) => onDragStart(e, task._id)}
        >
          <TaskCard
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskColumn;