import type { SharedProject } from '../types/collaboration';
import type { CalendarEvent, FocusSession, Reminder, TimeBlock } from '../types/notification';
import type { Task } from '../types/task';

interface ReminderSchedulerInput {
  tasks: Task[];
  projects: SharedProject[];
  calendarEvents?: CalendarEvent[];
  timeBlocks?: TimeBlock[];
  focusSessions?: FocusSession[];
  defaultReminderMinutes: number;
  now?: Date;
}

export function buildReminderSchedule(input: ReminderSchedulerInput): Reminder[] {
  const now = input.now ?? new Date();
  const reminders: Reminder[] = [];

  for (const task of input.tasks) {
    if (task.status === 'Completed' || task.status === 'Archived') continue;
    if (task.dueDate) {
      const dueAt = atBusinessHour(task.dueDate, 9);
      reminders.push(createReminder(task, 'exact', dueAt, `Due today: ${task.title}`));
      reminders.push(createReminder(task, 'relative', addMinutes(dueAt, -input.defaultReminderMinutes), `${task.title} is coming up`, -input.defaultReminderMinutes));

      if (dueAt.getTime() < now.getTime()) {
        reminders.push(createReminder(task, 'smart', addMinutes(now, 20), `Overdue: ${task.title}`));
      }
    }

    if (task.tags.includes('recurring')) {
      reminders.push(createReminder(task, 'recurring', nextMorning(now), `Recurring check-in: ${task.title}`, undefined, 'FREQ=DAILY'));
    }
  }

  for (const project of input.projects) {
    reminders.push({
      id: `reminder-project-${project.id}`,
      entityType: 'project',
      entityId: project.id,
      title: `Project review: ${project.name}`,
      type: 'smart',
      remindAt: addMinutes(new Date(project.updatedAt), 60 * 24 * 4).toISOString(),
      priority: 'Medium',
      targetUrl: `/project/${project.id}`,
      createdAt: now.toISOString(),
    });
  }

  for (const event of input.calendarEvents ?? []) {
    reminders.push(createTimedReminder('calendar', event.id, event.title, event.workspaceId, event.startsAt, input.defaultReminderMinutes, event.targetUrl, now));
  }

  for (const block of input.timeBlocks ?? []) {
    reminders.push(createTimedReminder('timeBlock', block.id, block.title, block.workspaceId, block.startsAt, 10, block.targetUrl, now));
  }

  for (const session of input.focusSessions ?? []) {
    reminders.push(createTimedReminder('focusSession', session.id, session.title, session.workspaceId, session.startsAt, 5, session.targetUrl, now));
  }

  return reminders.filter((reminder) => new Date(reminder.remindAt).getTime() >= addMinutes(now, -5).getTime());
}

export function snoozeReminder(source: Reminder, minutes: number): Reminder {
  const remindAt = addMinutes(new Date(), minutes).toISOString();
  return {
    ...source,
    id: `reminder-snooze-${source.id}-${Date.now()}`,
    type: 'snooze',
    remindAt,
    snoozedFromId: source.id,
    createdAt: new Date().toISOString(),
  };
}

function createReminder(task: Task, type: Reminder['type'], remindAt: Date, title: string, relativeMinutes?: number, recurrenceRule?: string): Reminder {
  return {
    id: `reminder-${type}-${task.id}`,
    entityType: task.tags.includes('recurring') ? 'recurringTask' : 'task',
    entityId: task.id,
    title,
    type,
    remindAt: remindAt.toISOString(),
    recurrenceRule,
    relativeMinutes,
    priority: task.priority,
    targetUrl: `/task/${task.id}`,
    createdAt: new Date().toISOString(),
  };
}

function createTimedReminder(
  entityType: Reminder['entityType'],
  entityId: string,
  title: string,
  workspaceId: string,
  startsAt: string,
  minutesBefore: number,
  targetUrl: string,
  now: Date,
): Reminder {
  return {
    id: `reminder-${entityType}-${entityId}`,
    entityType,
    entityId,
    title,
    type: 'relative',
    remindAt: addMinutes(new Date(startsAt), -minutesBefore).toISOString(),
    relativeMinutes: -minutesBefore,
    priority: 'Medium',
    targetUrl,
    createdAt: now.toISOString(),
  };
}

function atBusinessHour(date: string, hour: number) {
  const value = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
  return Number.isNaN(value.getTime()) ? new Date(date) : value;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function nextMorning(now: Date) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(9, 0, 0, 0);
  return next;
}
