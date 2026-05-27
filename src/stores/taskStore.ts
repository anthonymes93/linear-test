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
import { addTaskComment, deleteTaskDocument, persistTask, writeTaskActivity } from '../services/taskService';
import type { ActivityLog, CollaborationComment, SharedProject, Watcher, Workspace, WorkspaceInvite, WorkspaceMember } from '../types/collaboration';
import type { Attachment, Subtask, Task, TaskActivity, TaskComment, TaskFilters, TaskPriority, TaskStatus, TaskTag } from '../types/task';

type SyncMode = 'mock' | 'realtime';

const defaultFilters: TaskFilters = {
  search: '',
  priorities: [],
  tags: [],
  assigneeIds: [],
  showCompleted: true,
  sortBy: 'order',
  sortDirection: 'asc',
  groupBy: 'none',
} as TaskFilters;

interface TaskState {
  tasks: Task[];
  taskComments: TaskComment[];
  taskActivity: TaskActivity[];
  tags: TaskTag[];
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
  selectedTaskIds: string[];
  focusedTaskId: string | null;
  filters: TaskFilters;
  isLoading: boolean;
  syncMode: SyncMode;
  syncError: string | null;
  setTasks: (tasks: Task[]) => void;
  setTaskComments: (comments: TaskComment[]) => void;
  setTaskActivity: (activity: TaskActivity[]) => void;
  setTags: (tags: TaskTag[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSyncError: (message: string | null) => void;
  selectWorkspace: (workspaceId: string) => void;
  selectTask: (taskId: string | null) => void;
  focusTask: (taskId: string | null) => void;
  toggleSelectedTask: (taskId: string, additive?: boolean) => void;
  clearSelection: () => void;
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  resetFilters: () => void;
  addTask: (title: string, status?: TaskStatus) => Task;
  updateTask: (taskId: string, patch: Partial<Task>, activityDetail?: string) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  moveTask: (taskId: string, status: TaskStatus, beforeTaskId?: string | null) => void;
  bulkUpdateStatus: (status: TaskStatus) => void;
  bulkDelete: () => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  addNote: (taskId: string, note: string) => void;
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  addComment: (taskId: string, body: string) => void;
}

function now() {
  return new Date().toISOString();
}

function persistOptimistically(task: Task, detail?: string) {
  if (!isFirebaseConfigured) return;
  void persistTask(task).catch((error) => console.error('Failed to persist task', error));
  if (detail) {
    void writeTaskActivity({ taskId: task.id, actorId: currentUserId, action: 'task.updated', detail }).catch((error) =>
      console.error('Failed to write task activity', error),
    );
  }
}

function removeOptimistically(taskId: string) {
  if (!isFirebaseConfigured) return;
  void deleteTaskDocument(taskId).catch((error) => console.error('Failed to delete task', error));
}

function nextOrder(tasks: Task[], status: TaskStatus) {
  const orders = tasks.filter((task) => task.status === status).map((task) => task.order || 0);
  return (orders.length ? Math.max(...orders) : 0) + 10;
}

function createTask(state: TaskState, title: string, status: TaskStatus): Task {
  const timestamp = now();
  const workspace = state.workspaces.find((item) => item.id === state.selectedWorkspaceId);
  return {
    id: crypto.randomUUID(),
    workspaceId: state.selectedWorkspaceId,
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
    order: nextOrder(state.tasks, status),
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  taskComments: [],
  taskActivity: [],
  tags: [
    { id: 'tag-firebase', workspaceId: 'workspace-brainflow', name: 'firebase', color: '#7dd3fc', createdAt: now() },
    { id: 'tag-ux', workspaceId: 'workspace-brainflow', name: 'ux', color: '#c084fc', createdAt: now() },
    { id: 'tag-release', workspaceId: 'workspace-brainflow', name: 'release', color: '#fb7185', createdAt: now() },
  ],
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
  selectedTaskIds: [],
  focusedTaskId: mockTasks[0]?.id ?? null,
  filters: defaultFilters,
  isLoading: false,
  syncMode: isFirebaseConfigured ? 'realtime' : 'mock',
  syncError: null,
  setTasks: (tasks) =>
    set((state) => ({
      tasks,
      selectedTaskId: tasks.some((task) => task.id === state.selectedTaskId) ? state.selectedTaskId : tasks[0]?.id ?? null,
      focusedTaskId: tasks.some((task) => task.id === state.focusedTaskId) ? state.focusedTaskId : tasks[0]?.id ?? null,
      selectedTaskIds: state.selectedTaskIds.filter((id) => tasks.some((task) => task.id === id)),
      isLoading: false,
    })),
  setTaskComments: (taskComments) => set({ taskComments }),
  setTaskActivity: (taskActivity) => set({ taskActivity }),
  setTags: (tags) => set({ tags }),
  setLoading: (isLoading) => set({ isLoading }),
  setSyncError: (message) => set({ syncError: message, isLoading: false }),
  selectWorkspace: (workspaceId) =>
    set((state) => {
      const firstTask = state.tasks.find((task) => task.workspaceId === workspaceId);
      return { selectedWorkspaceId: workspaceId, selectedTaskId: firstTask?.id ?? null, focusedTaskId: firstTask?.id ?? null, selectedTaskIds: [] };
    }),
  selectTask: (taskId) => set({ selectedTaskId: taskId, focusedTaskId: taskId }),
  focusTask: (taskId) => set({ focusedTaskId: taskId }),
  toggleSelectedTask: (taskId, additive = true) =>
    set((state) => {
      const exists = state.selectedTaskIds.includes(taskId);
      if (!additive) return { selectedTaskIds: [taskId], focusedTaskId: taskId };
      return { selectedTaskIds: exists ? state.selectedTaskIds.filter((id) => id !== taskId) : [...state.selectedTaskIds, taskId], focusedTaskId: taskId };
    }),
  clearSelection: () => set({ selectedTaskIds: [] }),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
  addTask: (title, status = 'Inbox') => {
    const task = createTask(get(), title, status);
    set((state) => ({ tasks: [task, ...state.tasks], selectedTaskId: task.id, focusedTaskId: task.id }));
    persistOptimistically(task, 'Created task');
    return task;
  },
  updateTask: (taskId, patch, activityDetail) =>
    set((state) => {
      let updatedTask: Task | null = null;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        updatedTask = {
          ...task,
          ...patch,
          updatedAt: now(),
          completedAt: patch.status === 'Completed' ? now() : patch.status && patch.status !== 'Completed' ? null : task.completedAt,
        };
        return updatedTask;
      });
      if (updatedTask) persistOptimistically(updatedTask, activityDetail);
      return {
        tasks,
        taskActivity:
          activityDetail && !isFirebaseConfigured
            ? [
                { id: crypto.randomUUID(), taskId, actorId: currentUserId, action: 'task.updated', detail: activityDetail, createdAt: now() },
                ...state.taskActivity,
              ]
            : state.taskActivity,
      };
    }),
  deleteTask: (taskId) =>
    set((state) => {
      removeOptimistically(taskId);
      const tasks = state.tasks.filter((task) => task.id !== taskId);
      return {
        tasks,
        selectedTaskId: state.selectedTaskId === taskId ? tasks[0]?.id ?? null : state.selectedTaskId,
        focusedTaskId: state.focusedTaskId === taskId ? tasks[0]?.id ?? null : state.focusedTaskId,
        selectedTaskIds: state.selectedTaskIds.filter((id) => id !== taskId),
      };
    }),
  updateTaskStatus: (taskId, status) => get().updateTask(taskId, { status }, `Moved to ${status}`),
  moveTask: (taskId, status, beforeTaskId = null) =>
    set((state) => {
      const laneTasks = state.tasks.filter((task) => task.status === status && task.id !== taskId).sort((a, b) => a.order - b.order);
      const beforeIndex = beforeTaskId ? laneTasks.findIndex((task) => task.id === beforeTaskId) : -1;
      const before = beforeIndex >= 0 ? laneTasks[beforeIndex] : null;
      const previous = beforeIndex > 0 ? laneTasks[beforeIndex - 1] : null;
      const order = before ? ((previous?.order ?? 0) + before.order) / 2 : nextOrder(state.tasks, status);
      let updatedTask: Task | null = null;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        updatedTask = { ...task, status, order, updatedAt: now(), completedAt: status === 'Completed' ? now() : null };
        return updatedTask;
      });
      if (updatedTask) persistOptimistically(updatedTask, `Moved to ${status}`);
      return {
        tasks,
        focusedTaskId: taskId,
        taskActivity: !isFirebaseConfigured
          ? [{ id: crypto.randomUUID(), taskId, actorId: currentUserId, action: 'task.moved', detail: `Moved to ${status}`, createdAt: now() }, ...state.taskActivity]
          : state.taskActivity,
      };
    }),
  bulkUpdateStatus: (status) => {
    const ids = get().selectedTaskIds;
    ids.forEach((id) => get().updateTaskStatus(id, status));
    set({ selectedTaskIds: [] });
  },
  bulkDelete: () => {
    const ids = get().selectedTaskIds;
    ids.forEach((id) => get().deleteTask(id));
    set({ selectedTaskIds: [] });
  },
  addSubtask: (taskId, title) => {
    const subtask: Subtask = { id: crypto.randomUUID(), title, completed: false };
    const task = get().tasks.find((item) => item.id === taskId);
    if (task && title.trim()) get().updateTask(taskId, { subtasks: [...task.subtasks, subtask] }, 'Added subtask');
  },
  toggleSubtask: (taskId, subtaskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (task) get().updateTask(taskId, { subtasks: task.subtasks.map((item) => (item.id === subtaskId ? { ...item, completed: !item.completed } : item)) }, 'Updated subtask');
  },
  removeSubtask: (taskId, subtaskId) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (task) get().updateTask(taskId, { subtasks: task.subtasks.filter((item) => item.id !== subtaskId) }, 'Removed subtask');
  },
  addNote: (taskId, note) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (task && note.trim()) get().updateTask(taskId, { notes: [...task.notes, note.trim()] }, 'Added note');
  },
  addAttachment: (taskId, attachment) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (task) get().updateTask(taskId, { attachments: [...task.attachments, { ...attachment, id: crypto.randomUUID(), createdAt: now() }] }, 'Added attachment');
  },
  addComment: (taskId, body) => {
    const text = body.trim();
    if (!text) return;
    const comment: TaskComment = { id: crypto.randomUUID(), taskId, userId: currentUserId, body: text, createdAt: now(), updatedAt: now() };
    set((state) => ({ taskComments: [...state.taskComments, comment] }));
    if (isFirebaseConfigured) {
      void addTaskComment(taskId, currentUserId, text).catch((error) => console.error('Failed to add task comment', error));
    }
  },
}));
