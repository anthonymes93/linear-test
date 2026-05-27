import type { TaskPriority } from './task';

export type SpaceName = 'Personal' | 'Business' | 'Clients' | 'Ideas' | 'Learning';

export type SpaceIcon = 'user' | 'briefcase' | 'handshake' | 'sparkles' | 'book';

export interface Space {
  id: string;
  workspaceId: string;
  name: SpaceName;
  icon: SpaceIcon;
  color: string;
  description: string;
  taskCount: number;
  projectCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Idea' | 'Planned' | 'Active' | 'Waiting' | 'Completed' | 'Archived';

export interface ProjectNote {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  spaceId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  dueDate: string | null;
  progress: number;
  linkedTaskIds: string[];
  notes: ProjectNote[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskLink {
  id: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
  order: number;
  createdAt: string;
}

export interface PlanningSession {
  id: string;
  workspaceId: string;
  weekStart: string;
  focus: string;
  taskDayMap: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
