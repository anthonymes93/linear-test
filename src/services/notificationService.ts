import type { BrainFlowNotification, NotificationAction, NotificationPriority, Reminder } from '../types/notification';

const priorityRank: Record<NotificationPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export function sortNotifications(items: BrainFlowNotification[]) {
  return [...items].sort((first, second) => {
    const priorityDelta = priorityRank[second.priority] - priorityRank[first.priority];
    if (priorityDelta) return priorityDelta;
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
}

export function buildReminderNotification(workspaceId: string, reminder: Reminder, now = new Date().toISOString()): BrainFlowNotification {
  return {
    id: `notification-${reminder.id}`,
    workspaceId,
    category: 'reminder',
    entityType: reminder.entityType,
    entityId: reminder.entityId,
    title: reminder.title,
    body: reminder.type === 'smart' ? 'BrainFlow found a timely moment to remind you.' : `Reminder scheduled for ${formatTime(reminder.remindAt)}.`,
    priority: reminder.priority,
    status: 'unread',
    groupKey: `${reminder.entityType}:${reminder.entityId}`,
    targetUrl: reminder.targetUrl,
    actions: defaultActions(reminder.targetUrl),
    createdAt: now,
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
    reminderId: reminder.id,
  };
}

export function createAlertNotification(input: {
  id: string;
  workspaceId: string;
  entityType: BrainFlowNotification['entityType'];
  entityId: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  groupKey: string;
  targetUrl?: string;
  createdAt?: string;
}): BrainFlowNotification {
  return {
    id: input.id,
    workspaceId: input.workspaceId,
    category: 'alert',
    entityType: input.entityType,
    entityId: input.entityId,
    title: input.title,
    body: input.body,
    priority: input.priority,
    status: 'unread',
    groupKey: input.groupKey,
    targetUrl: input.targetUrl,
    actions: defaultActions(input.targetUrl),
    createdAt: input.createdAt ?? new Date().toISOString(),
    readAt: null,
    archivedAt: null,
    snoozedUntil: null,
  };
}

export function isInQuietHours(now: Date, start: string, end: string) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseClock(start);
  const endMinutes = parseClock(end);

  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function groupNotifications(items: BrainFlowNotification[]) {
  return sortNotifications(items).reduce<Record<string, BrainFlowNotification[]>>((groups, item) => {
    groups[item.groupKey] = [...(groups[item.groupKey] ?? []), item];
    return groups;
  }, {});
}

function defaultActions(targetUrl?: string): NotificationAction[] {
  return [
    { id: 'open', label: 'Open', kind: 'open', targetUrl },
    { id: 'snooze', label: 'Snooze', kind: 'snooze' },
    { id: 'archive', label: 'Archive', kind: 'archive' },
  ];
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function parseClock(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}
