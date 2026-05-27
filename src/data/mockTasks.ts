import type { Task } from '../types/task';

const now = new Date().toISOString();

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Design realtime task sync contract',
    description: 'Define Firestore document shape, optimistic mutation flow, and listener boundaries for BrainFlow tasks.',
    priority: 'Critical',
    status: 'In Progress',
    dueDate: '2026-05-29',
    tags: ['firebase', 'architecture'],
    subtasks: [
      { id: 'sub-001', title: 'Map task collection indexes', completed: true },
      { id: 'sub-002', title: 'Document write conflict strategy', completed: false },
    ],
    notes: ['Keep task documents flat for list rendering and move heavy assets into Storage metadata.'],
    attachments: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: 'task-002',
    title: 'Polish command palette interaction model',
    description: 'Make task creation and navigation reachable through a single keyboard-first interface.',
    priority: 'High',
    status: 'Today',
    dueDate: '2026-05-27',
    tags: ['ux', 'keyboard'],
    subtasks: [{ id: 'sub-003', title: 'Support Ctrl+K and Escape', completed: true }],
    notes: ['Palette should feel immediate and stay visually quiet.'],
    attachments: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
  {
    id: 'task-003',
    title: 'Create launch review checklist',
    description: 'Assemble the high-signal checklist for auth, Firestore rules, storage policies, and release readiness.',
    priority: 'Medium',
    status: 'Upcoming',
    dueDate: '2026-06-03',
    tags: ['release'],
    subtasks: [],
    notes: [],
    attachments: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  },
];
