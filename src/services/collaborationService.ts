export const collaborationCollections = {
  workspaces: 'workspaces',
  workspaceMembers: 'workspace_members',
  invites: 'invites',
  comments: 'comments',
  mentions: 'mentions',
  activityLogs: 'activity_logs',
  watchers: 'watchers',
} as const;

export const firestoreDataModel = [
  'workspaces/{workspaceId}',
  'workspace_members/{workspaceId_userId}',
  'invites/{inviteId}',
  'comments/{commentId}',
  'mentions/{mentionId}',
  'activity_logs/{activityId}',
  'watchers/{workspaceId_entityType_entityId_userId}',
  'tasks/{taskId}',
  'projects/{projectId}',
] as const;

export const securityRuleStrategy = [
  'Personal records include ownerId and are only readable or writable by that authenticated owner.',
  'Workspace records require a matching workspace_members document before any read.',
  'Role checks map Owner/Admin/Member/Guest to view, create, edit, delete, invite, billing, and settings actions.',
  'Guests can view assigned or explicitly shared records and create comments only when workspace settings allow it.',
  'Invites are writable by Owner/Admin roles and readable by the inviter, invitee email claim, or workspace admins.',
  'Comments, mentions, activity logs, and watchers validate workspaceId against the parent task or project.',
] as const;
