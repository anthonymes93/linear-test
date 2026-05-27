import type { TaskPriority } from './task';

export type NotificationEntityType = 'task' | 'project' | 'calendar' | 'timeBlock' | 'recurringTask' | 'focusSession' | 'system';

export type ReminderType = 'exact' | 'relative' | 'recurring' | 'smart' | 'snooze';

export type NotificationCategory = 'reminder' | 'alert' | 'push' | 'system';

export type NotificationStatus = 'unread' | 'read' | 'archived' | 'dismissed';

export type NotificationPriority = TaskPriority;

export interface NotificationAction {
  id: string;
  label: string;
  targetUrl?: string;
  kind: 'open' | 'complete' | 'snooze' | 'archive' | 'dismiss';
}

export interface Reminder {
  id: string;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  type: ReminderType;
  remindAt: string;
  recurrenceRule?: string;
  relativeMinutes?: number;
  snoozedFromId?: string;
  priority: NotificationPriority;
  targetUrl: string;
  createdAt: string;
}

export interface BrainFlowNotification {
  id: string;
  workspaceId: string;
  category: NotificationCategory;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  groupKey: string;
  targetUrl?: string;
  actions: NotificationAction[];
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  reminderId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  defaultReminderMinutes: number;
  alertCategories: Record<'overdue' | 'projectRisk' | 'scheduleLoad' | 'missedFocus' | 'deadline' | 'staleProject' | 'recurringFailure', boolean>;
  permissionStatus: NotificationPermission | 'unsupported';
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh?: string;
    auth?: string;
  };
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  startsAt: string;
  targetUrl: string;
}

export interface TimeBlock {
  id: string;
  workspaceId: string;
  title: string;
  startsAt: string;
  targetUrl: string;
}

export interface FocusSession {
  id: string;
  workspaceId: string;
  title: string;
  startsAt: string;
  completed: boolean;
  targetUrl: string;
}
