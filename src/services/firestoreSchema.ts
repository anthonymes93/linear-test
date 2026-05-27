export const firestoreCollections = {
  users: 'users',
  tasks: 'tasks',
  taskActivity: 'task_activity',
  taskComments: 'task_comments',
  tags: 'tags',
} as const;

export const firestoreIndexPlan = [
  'tasks: workspaceId asc, order asc, updatedAt desc',
  'tasks: workspaceId asc, status asc, order asc',
  'tasks: workspaceId asc, assigneeIds array-contains, updatedAt desc',
  'tasks: workspaceId asc, tags array-contains, updatedAt desc',
  'task_comments: taskId asc, createdAt asc',
  'task_activity: taskId asc, createdAt desc',
  'tags: workspaceId asc, name asc',
] as const;
