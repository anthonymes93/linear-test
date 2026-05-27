export type TaskStatus = 'Inbox' | 'Today' | 'Upcoming' | 'In Progress' | 'Waiting' | 'Completed' | 'Archived';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
  subtasks: Subtask[];
  notes: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
