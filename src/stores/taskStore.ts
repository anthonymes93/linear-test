import { create } from 'zustand';
import {
  currentUserId,
  mockActivityLogs,
  mockComments,
  mockInvites,
  mockMembers,
  mockProjects,
  mockWatchers,
  mockWorkspaces,
} from '../data/mockCollaboration';
import { mockTasks } from '../data/mockTasks';
import type { ActivityLog, CollaborationComment, SharedProject, Watcher, Workspace, WorkspaceInvite, WorkspaceMember } from '../types/collaboration';
import type { Task, TaskPriority, TaskStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  workspaces: Workspace[];
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  projects: SharedProject[];
  comments: CollaborationComment[];
  activityLogs: ActivityLog[];
  watchers: Watcher[];
  currentUserId: string;
  selectedWorkspaceId: string;
  selectedTaskId: string | null;
  isLoading: boolean;
  selectWorkspace: (workspaceId: string) => void;
  selectTask: (taskId: string | null) => void;
  addTask: (title: string, status?: TaskStatus) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  workspaces: mockWorkspaces,
  members: mockMembers,
  invites: mockInvites,
  projects: mockProjects,
  comments: mockComments,
  activityLogs: mockActivityLogs,
  watchers: mockWatchers,
  currentUserId,
  selectedWorkspaceId: 'workspace-brainflow',
  selectedTaskId: mockTasks[0]?.id ?? null,
  isLoading: false,
  selectWorkspace: (workspaceId) =>
    set((state) => {
      const firstTask = state.tasks.find((task) => task.workspaceId === workspaceId);
      return { selectedWorkspaceId: workspaceId, selectedTaskId: firstTask?.id ?? null };
    }),
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  addTask: (title, status = 'Inbox') => {
    const timestamp = new Date().toISOString();
    const workspaceId = get().selectedWorkspaceId;
    const workspace = get().workspaces.find((item) => item.id === workspaceId);
    const task: Task = {
      id: crypto.randomUUID(),
      workspaceId,
      projectId: null,
      spaceType: workspace?.plan === 'Team' ? 'Team' : 'Personal',
      title,
      description: '',
      priority: 'Medium' satisfies TaskPriority,
      status,
      dueDate: null,
      assigneeIds: [currentUserId],
      watcherIds: [currentUserId],
      tags: [],
      subtasks: [],
      notes: [],
      attachments: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
    };

    // Optimistic first: Firestore persistence can attach here without changing consuming components.
    set({ tasks: [task, ...get().tasks], selectedTaskId: task.id });
    return task;
  },
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === 'Completed' ? new Date().toISOString() : task.completedAt,
            }
          : task,
      ),
    })),
}));
