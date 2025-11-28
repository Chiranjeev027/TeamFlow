// teamflow/frontend/src/types/index.ts
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: { _id: string; name: string; email: string; isOnline?: boolean };
  dueDate?: string;
  createdBy: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string };
  members: Array<{ _id: string; name: string; email: string }>;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
}