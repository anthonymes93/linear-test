import type { WorkspaceMember } from '../types/collaboration';
import type { Task, TaskFilters, TaskPriority } from '../types/task';

const priorityWeight: Record<TaskPriority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function textIncludes(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

export function selectVisibleTasks(tasks: Task[], workspaceId: string, status: string, filters: TaskFilters) {
  const query = filters.search.trim().toLowerCase();

  return tasks
    .filter((task) => {
      if (task.workspaceId !== workspaceId) return false;
      if (status !== 'All' && task.status !== status) return false;
      if (!filters.showCompleted && task.status === 'Completed') return false;
      if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
      if (filters.tags.length && !filters.tags.every((tag) => task.tags.includes(tag))) return false;
      if (filters.assigneeIds.length && !filters.assigneeIds.some((id) => task.assigneeIds.includes(id))) return false;
      if (!query) return true;

      return (
        textIncludes(task.title, query) ||
        textIncludes(task.description, query) ||
        task.tags.some((tag) => textIncludes(tag, query)) ||
        task.notes.some((note) => textIncludes(note, query))
      );
    })
    .sort((a, b) => {
      const direction = filters.sortDirection === 'asc' ? 1 : -1;
      if (filters.sortBy === 'priority') return (priorityWeight[a.priority] - priorityWeight[b.priority]) * direction;
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title) * direction;
      const left = a[filters.sortBy] ?? '';
      const right = b[filters.sortBy] ?? '';
      return String(left).localeCompare(String(right)) * direction;
    });
}

export function groupTasks(tasks: Task[], filters: TaskFilters, members: WorkspaceMember[]) {
  if (filters.groupBy === 'none') return [{ label: 'Tasks', tasks }];

  const buckets = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const assigneeNames = task.assigneeIds
      .map((id) => members.find((member) => member.userId === id)?.displayName ?? 'Unassigned')
      .join(', ');
    const label =
      filters.groupBy === 'status'
        ? task.status
        : filters.groupBy === 'priority'
          ? task.priority
          : filters.groupBy === 'assignee'
            ? assigneeNames || 'Unassigned'
            : task.dueDate ?? 'No due date';

    buckets.set(label, [...(buckets.get(label) ?? []), task]);
  });

  return Array.from(buckets.entries()).map(([label, groupedTasks]) => ({ label, tasks: groupedTasks }));
}
