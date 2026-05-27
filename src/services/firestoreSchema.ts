export const firestoreCollections = {
  users: 'users',
  tasks: 'tasks',
  taskActivity: 'task_activity',
  taskComments: 'task_comments',
  tags: 'tags',
  spaces: 'spaces',
  projects: 'projects',
  projectTasks: 'project_tasks',
  planningSessions: 'planning_sessions',
} as const;

export const firestoreIndexPlan = [
  'tasks: workspaceId asc, order asc, updatedAt desc',
  'tasks: workspaceId asc, status asc, order asc',
  'tasks: workspaceId asc, assigneeIds array-contains, updatedAt desc',
  'tasks: workspaceId asc, tags array-contains, updatedAt desc',
  'task_comments: taskId asc, createdAt asc',
  'task_activity: taskId asc, createdAt desc',
  'tags: workspaceId asc, name asc',
  'spaces: workspaceId asc, order asc',
  'projects: workspaceId asc, status asc, dueDate asc',
  'projects: workspaceId asc, spaceId asc, updatedAt desc',
  'project_tasks: projectId asc, order asc',
  'project_tasks: taskId asc, createdAt desc',
  'planning_sessions: workspaceId asc, weekStart desc',
] as const;
