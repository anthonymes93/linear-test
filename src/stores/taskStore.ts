import { create } from 'zustand';
import { mockTasks } from '../data/mockTasks';
import type { Task, TaskPriority, TaskStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  selectTask: (taskId: string | null) => void;
  addTask: (title: string, status?: TaskStatus) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  selectedTaskId: mockTasks[0]?.id ?? null,
  isLoading: false,
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  addTask: (title, status = 'Inbox') => {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description: '',
      priority: 'Medium' satisfies TaskPriority,
      status,
      dueDate: null,
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
