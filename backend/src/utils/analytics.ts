// teamflow/backend/src/utils/analytics.ts
import { ITask } from '../models/Task'; // Changed from TaskDocument to ITask

interface AnalyticsResult {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export function computeAnalyticsFromTasks(tasks: ITask[]): AnalyticsResult {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    todoTasks: todo,
    highPriorityTasks: highPriority,
    overdueTasks: overdue,
    completionRate
  };
}

export default computeAnalyticsFromTasks;