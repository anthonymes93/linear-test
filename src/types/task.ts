export type TaskStatus = 'Inbox' | 'Today' | 'Upcoming' | 'In Progress' | 'Waiting' | 'Completed' | 'Archived';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskSortKey = 'order' | 'updatedAt' | 'createdAt' | 'dueDate' | 'priority' | 'title';

export type TaskGroupKey = 'none' | 'status' | 'priority' | 'dueDate' | 'assignee';

export interface TaskFilters {
  search: string;
  priorities: TaskPriority[];
  tags: string[];
  assigneeIds: string[];
  showCompleted: boolean;
  sortBy: TaskSortKey;
  sortDirection: 'asc' | 'desc';
  groupBy: TaskGroupKey;
}

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
  createdAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorId: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface TaskTag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string | null;
  spaceType: 'Personal' | 'Team';
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  assigneeIds: string[];
  watcherIds: string[];
  tags: string[];
  subtasks: Subtask[];
  notes: string[];
  attachments: Attachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
