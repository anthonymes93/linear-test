import type { TaskPriority, TaskStatus } from '../types/task';

export interface ParsedQuickAdd {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
}

const priorityWords: Record<string, TaskPriority> = {
  low: 'Low',
  medium: 'Medium',
  normal: 'Medium',
  high: 'High',
  critical: 'Critical',
  urgent: 'Critical',
};

const statusHints: Array<[RegExp, TaskStatus]> = [
  [/\binbox\b/i, 'Inbox'],
  [/\btoday\b/i, 'Today'],
  [/\bupcoming\b/i, 'Upcoming'],
  [/\bin progress\b/i, 'In Progress'],
  [/\bwaiting\b/i, 'Waiting'],
  [/\bcompleted?\b/i, 'Completed'],
];

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekday(dayName: string) {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const target = weekdays.indexOf(dayName.toLowerCase());
  const date = new Date();
  const current = date.getDay();
  let delta = (target - current + 7) % 7;
  if (delta === 0) delta = 7;
  date.setDate(date.getDate() + delta);
  return formatDate(date);
}

function parseDueDate(input: string) {
  const lower = input.toLowerCase();
  const date = new Date();
  if (/\btoday\b/.test(lower)) return formatDate(date);
  if (/\btomorrow\b/.test(lower)) {
    date.setDate(date.getDate() + 1);
    return formatDate(date);
  }
  const nextMatch = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextMatch) return nextWeekday(nextMatch[1]);
  const weekdayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekdayMatch) return nextWeekday(weekdayMatch[1]);
  return null;
}

function parseTime(input: string) {
  const match = input.match(/\b(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2] ?? '00';
  return `${hour}:${minute} ${match[3].toLowerCase()}`;
}

export function parseNaturalLanguageTask(input: string, fallbackStatus: TaskStatus = 'Inbox'): ParsedQuickAdd {
  let title = input.trim();
  const tags = Array.from(title.matchAll(/#([\w-]+)/g)).map((match) => match[1]);
  tags.forEach((tag) => {
    title = title.replace(new RegExp(`#${tag}\\b`, 'i'), '');
  });

  const dueDate = parseDueDate(title);
  const dueTime = parseTime(title);
  let priority: TaskPriority = 'Medium';
  let status: TaskStatus = fallbackStatus;

  for (const [word, value] of Object.entries(priorityWords)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(title)) {
      priority = value;
      title = title.replace(new RegExp(`\\b${word}(?:\\s+priority)?\\b`, 'gi'), '');
    }
  }

  for (const [pattern, value] of statusHints) {
    if (pattern.test(title)) status = value;
  }

  title = title
    .replace(/\b(next\s+)?(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(?:at\s*)?\d{1,2}(?::\d{2})?\s*(am|pm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: title || input.trim() || 'New task',
    dueDate,
    dueTime,
    priority,
    tags,
    status,
  };
}
