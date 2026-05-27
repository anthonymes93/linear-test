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
import { isFirebaseConfigured } from '../lib/firebase';
import { persistTask } from '../services/taskService';
import type { ActivityLog, CollaborationComment, SharedProject, Watcher, Workspace, WorkspaceInvite, WorkspaceMember } from '../types/collaboration';
import type { Task, TaskPriority, TaskStatus } from '../types/task';

type SyncMode = 'mock' | 'realtime';

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
  syncMode: SyncMode;
  syncError: string | null;
  setTasks: (tasks: Task[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSyncError: (message: string | null) => void;
  selectWorkspace: (workspaceId: string) => void;
  selectTask: (taskId: string | null) => void;
  addTask: (title: string, status?: TaskStatus) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

function persistOptimistically(task: Task) {
  if (!isFirebaseConfigured) return;
  void persistTask(task).catch((error) => {
    console.error('Failed to persist task', error);
  });
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
  syncMode: isFirebaseConfigured ? 'realtime' : 'mock',
  syncError: null,
  setTasks: (tasks) =>
    set((state) => ({
      tasks,
      selectedTaskId: tasks.some((task) => task.id === state.selectedTaskId) ? state.selectedTaskId : tasks[0]?.id ?? null,
      isLoading: false,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setSyncError: (message) => set({ syncError: message, isLoading: false }),
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

    set({ tasks: [task, ...get().tasks], selectedTaskId: task.id });
    persistOptimistically(task);
    return task;
  },
  updateTaskStatus: (taskId, status) =>
    set((state) => {
      let updatedTask: Task | null = null;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;

        updatedTask = {
          ...task,
          status,
          updatedAt: new Date().toISOString(),
          completedAt: status === 'Completed' ? new Date().toISOString() : null,
        };
        return updatedTask;
      });

      if (updatedTask) persistOptimistically(updatedTask);
      return { tasks };
    }),
}));
