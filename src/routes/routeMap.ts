import type { TaskStatus } from '../types/task';

const routeMap: Record<string, TaskStatus> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed',
  archived: 'Archived',
};

export function routeToStatus(route?: string): TaskStatus {
  return route ? routeMap[route] ?? 'Inbox' : 'Inbox';
}
