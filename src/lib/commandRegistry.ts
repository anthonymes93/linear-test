import {
  Archive,
  Calendar,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Focus,
  Inbox,
  Keyboard,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Tag,
  Trash2,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { NavigateFunction } from 'react-router-dom';
import { isFirebaseConfigured } from './firebase';
import { parseNaturalLanguageTask } from './naturalLanguageParser';
import { useOverlayStore } from '../stores/overlayStore';
import { useTaskStore } from '../stores/taskStore';
import { useUiStore } from '../stores/uiStore';
import type { CommandDefinition } from '../types/command';
import type { TaskPriority, TaskStatus } from '../types/task';

const destinations: Array<{ title: string; status: TaskStatus; path: string; icon: typeof Inbox; shortcut?: string }> = [
  { title: 'Go to Inbox', status: 'Inbox', path: '/inbox', icon: Inbox, shortcut: '1' },
  { title: 'Go to Today', status: 'Today', path: '/today', icon: Calendar, shortcut: '2' },
  { title: 'Go to Upcoming', status: 'Upcoming', path: '/upcoming', icon: Calendar, shortcut: '3' },
  { title: 'Go to Completed', status: 'Completed', path: '/completed', icon: CheckCircle2, shortcut: '4' },
];

export function createCommandRegistry(navigate: NavigateFunction): CommandDefinition[] {
  const taskState = useTaskStore.getState();
  const focusedTask = taskState.tasks.find((task) => task.id === taskState.focusedTaskId || task.id === taskState.selectedTaskId);
  const selectedCount = taskState.selectedTaskIds.length;
  const createParsedTask = (query: string) => {
    const parsed = parseNaturalLanguageTask(query, 'Inbox');
    const task = useTaskStore.getState().addTask(parsed.title, parsed.status);
    useTaskStore.getState().updateTask(
      task.id,
      {
        dueDate: parsed.dueDate,
        priority: parsed.priority,
        tags: parsed.tags,
        description: parsed.dueTime ? `Due at ${parsed.dueTime}` : task.description,
      },
      'Created with quick add',
    );
    toast.success(`Created ${parsed.title}`);
  };

  const commands: CommandDefinition[] = [
    {
      id: 'task.create',
      title: 'Create task',
      subtitle: 'Use the current search text as a smart task title',
      group: 'Create',
      keywords: ['new', 'quick add', 'todo'],
      shortcut: 'Q',
      icon: Plus,
      suggested: true,
      perform: ({ query, close }) => {
        createParsedTask(query || 'New task');
        close();
      },
    },
    {
      id: 'project.create',
      title: 'Create project',
      subtitle: 'Start a workspace project',
      group: 'Create',
      keywords: ['new', 'workspace'],
      icon: ClipboardList,
      perform: ({ query, close }) => {
        const project = useTaskStore.getState().addProject(query || 'New project');
        toast.success(`Created ${project.name}`);
        close();
      },
    },
    {
      id: 'tasks.search',
      title: 'Search tasks',
      subtitle: 'Focus the task search field',
      group: 'Navigate',
      keywords: ['find', 'filter'],
      shortcut: '/',
      icon: Search,
      suggested: true,
      perform: ({ query, close }) => {
        close();
        requestAnimationFrame(() => {
          const input = document.querySelector<HTMLInputElement>('[data-task-search]');
          input?.focus();
          if (query && input) input.value = query;
        });
      },
    },
    ...destinations.map<CommandDefinition>((destination) => ({
      id: `nav.${destination.status.toLowerCase().replace(/\s+/g, '-')}`,
      title: destination.title,
      subtitle: `${destination.status} task lane`,
      group: 'Navigate',
      nestedGroup: 'Sections',
      keywords: ['go', 'jump', destination.status],
      shortcut: destination.shortcut,
      icon: destination.icon,
      perform: ({ close }) => {
        navigate(destination.path);
        close();
      },
    })),
    {
      id: 'theme.toggle',
      title: 'Toggle dark/light mode',
      subtitle: 'Switch the BrainFlow theme',
      group: 'App',
      keywords: ['theme', 'dark', 'light', 'dim'],
      icon: Moon,
      perform: ({ close }) => {
        useUiStore.getState().toggleTheme();
        close();
      },
    },
    ...(['Critical', 'High', 'Medium', 'Low'] as TaskPriority[]).map<CommandDefinition>((priority) => ({
      id: `priority.${priority.toLowerCase()}`,
      title: `Change task priority to ${priority}`,
      subtitle: focusedTask ? focusedTask.title : 'Select a task first',
      group: 'Task',
      nestedGroup: 'Priority',
      keywords: ['priority', priority],
      icon: Zap,
      disabled: !focusedTask,
      perform: ({ close }) => {
        if (focusedTask) useTaskStore.getState().updateTask(focusedTask.id, { priority }, `Priority changed to ${priority}`);
        close();
      },
    })),
    ...(['Inbox', 'Today', 'Upcoming', 'In Progress', 'Waiting', 'Completed'] as TaskStatus[]).map<CommandDefinition>((status) => ({
      id: `status.${status.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Move task to ${status}`,
      subtitle: focusedTask ? focusedTask.title : 'Select a task first',
      group: 'Task',
      nestedGroup: 'Status',
      keywords: ['move', 'status', status],
      icon: CircleDot,
      disabled: !focusedTask,
      perform: ({ close }) => {
        if (focusedTask) useTaskStore.getState().updateTaskStatus(focusedTask.id, status);
        close();
      },
    })),
    {
      id: 'tag.add',
      title: 'Add tag',
      subtitle: 'Apply the search text as a tag to the focused task',
      group: 'Task',
      keywords: ['label', 'hashtag'],
      icon: Tag,
      disabled: !focusedTask,
      perform: ({ query, close }) => {
        useTaskStore.getState().addTagToFocusedTask(query || 'follow-up');
        close();
      },
    },
    {
      id: 'completed.clear',
      title: 'Clear completed',
      subtitle: 'Remove all completed tasks',
      group: 'Bulk',
      keywords: ['delete', 'done'],
      icon: Trash2,
      tone: 'danger',
      perform: ({ close }) => {
        useTaskStore.getState().clearCompleted();
        toast.success('Completed tasks cleared');
        close();
      },
    },
    {
      id: 'bulk.archive',
      title: 'Bulk archive',
      subtitle: selectedCount ? `Archive ${selectedCount} selected tasks` : 'Select tasks first',
      group: 'Bulk',
      keywords: ['archive', 'selected'],
      icon: Archive,
      disabled: selectedCount === 0,
      perform: ({ close }) => {
        useTaskStore.getState().bulkUpdateStatus('Archived');
        close();
      },
    },
    {
      id: 'settings.open',
      title: 'Open settings',
      group: 'App',
      keywords: ['preferences'],
      icon: Settings,
      perform: ({ close }) => {
        useOverlayStore.getState().setSettingsOpen(true);
        close();
      },
    },
    {
      id: 'shortcuts.open',
      title: 'Open keyboard shortcuts',
      group: 'App',
      keywords: ['help', 'keys'],
      icon: Keyboard,
      perform: ({ close }) => {
        useOverlayStore.getState().setShortcutsOpen(true);
        close();
      },
    },
    {
      id: 'firebase.sync',
      title: 'Sync Firebase',
      subtitle: isFirebaseConfigured ? 'Refresh realtime state' : 'Firebase is not configured',
      group: 'App',
      keywords: ['cloud', 'reload'],
      icon: RefreshCw,
      perform: ({ close }) => {
        toast.success(isFirebaseConfigured ? 'Firebase sync requested' : 'Using mock data');
        close();
      },
    },
    {
      id: 'focus.open',
      title: 'Focus mode',
      subtitle: focusedTask ? focusedTask.title : 'Select a task first',
      group: 'Productivity',
      keywords: ['zen', 'deep work', 'timer'],
      shortcut: 'F',
      icon: Focus,
      suggested: true,
      disabled: !focusedTask,
      perform: ({ close }) => {
        useOverlayStore.getState().setFocusModeOpen(true);
        close();
      },
    },
    {
      id: 'overdue.review',
      title: 'Review overdue tasks',
      subtitle: 'Search tasks with dates before today',
      group: 'Productivity',
      keywords: ['late', 'due', 'review'],
      icon: Sparkles,
      perform: ({ close }) => {
        const today = new Date().toISOString().slice(0, 10);
        useTaskStore.getState().setFilter('search', '');
        const overdue = useTaskStore.getState().tasks.find((task) => task.dueDate && task.dueDate < today && task.status !== 'Completed');
        if (overdue) useTaskStore.getState().selectTask(overdue.id);
        toast.success(overdue ? 'Opened oldest overdue task' : 'No overdue tasks');
        close();
      },
    },
  ];

  return commands;
}
