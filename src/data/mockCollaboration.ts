import type {
  ActivityLog,
  CollaborationComment,
  Mention,
  SharedProject,
  Watcher,
  Workspace,
  WorkspaceInvite,
  WorkspaceMember,
} from '../types/collaboration';

const now = new Date().toISOString();

export const currentUserId = 'user-ava';

export const mockWorkspaces: Workspace[] = [
  {
    id: 'workspace-personal',
    name: 'Personal BrainFlow',
    plan: 'Personal',
    ownerId: currentUserId,
    defaultSpaceVisibility: 'Private',
    billingReady: false,
    settings: {
      domainInvites: false,
      guestCommentsOnly: true,
      requireApprovalForGuests: true,
    },
  },
  {
    id: 'workspace-brainflow',
    name: 'BrainFlow Team',
    plan: 'Team',
    ownerId: currentUserId,
    defaultSpaceVisibility: 'Workspace',
    billingReady: true,
    settings: {
      domainInvites: true,
      guestCommentsOnly: true,
      requireApprovalForGuests: true,
    },
  },
];

export const mockMembers: WorkspaceMember[] = [
  {
    id: 'member-ava',
    workspaceId: 'workspace-brainflow',
    userId: currentUserId,
    name: 'Ava Chen',
    email: 'ava@brainflow.app',
    role: 'Owner',
    avatarColor: '#7dd3fc',
    status: 'Active',
    lastActiveAt: now,
  },
  {
    id: 'member-milo',
    workspaceId: 'workspace-brainflow',
    userId: 'user-milo',
    name: 'Milo Grant',
    email: 'milo@brainflow.app',
    role: 'Admin',
    avatarColor: '#34d399',
    status: 'Active',
    lastActiveAt: now,
  },
  {
    id: 'member-nia',
    workspaceId: 'workspace-brainflow',
    userId: 'user-nia',
    name: 'Nia Patel',
    email: 'nia@brainflow.app',
    role: 'Member',
    avatarColor: '#fbbf24',
    status: 'Active',
    lastActiveAt: now,
  },
  {
    id: 'member-eli',
    workspaceId: 'workspace-brainflow',
    userId: 'user-eli',
    name: 'Eli Brooks',
    email: 'eli@partner.dev',
    role: 'Guest',
    avatarColor: '#fb7185',
    status: 'Guest',
    lastActiveAt: now,
  },
  {
    id: 'member-personal',
    workspaceId: 'workspace-personal',
    userId: currentUserId,
    name: 'Ava Chen',
    email: 'ava@brainflow.app',
    role: 'Owner',
    avatarColor: '#7dd3fc',
    status: 'Active',
    lastActiveAt: now,
  },
];

export const mockInvites: WorkspaceInvite[] = [
  {
    id: 'invite-zoe',
    workspaceId: 'workspace-brainflow',
    email: 'zoe@brainflow.app',
    role: 'Member',
    invitedBy: currentUserId,
    status: 'Pending',
    expiresAt: '2026-06-02',
  },
];

export const mockProjects: SharedProject[] = [
  {
    id: 'project-sync',
    workspaceId: 'workspace-brainflow',
    name: 'Realtime Collaboration',
    description: 'Shared task sync, comments, mentions, and permission-aware workspace flows.',
    visibility: 'Workspace',
    ownerId: currentUserId,
    followerIds: [currentUserId, 'user-milo', 'user-nia'],
    taskIds: ['task-001', 'task-002'],
    updatedAt: now,
  },
  {
    id: 'project-launch',
    workspaceId: 'workspace-brainflow',
    name: 'Launch Readiness',
    description: 'Final checks for rules, auth, storage policy, and operational handoff.',
    visibility: 'Invite-only',
    ownerId: 'user-milo',
    followerIds: [currentUserId, 'user-milo'],
    taskIds: ['task-003'],
    updatedAt: now,
  },
];

export const mockComments: CollaborationComment[] = [
  {
    id: 'comment-001',
    workspaceId: 'workspace-brainflow',
    entityType: 'task',
    entityId: 'task-001',
    authorId: 'user-milo',
    body: '@Ava can you confirm the listener boundary before we wire optimistic writes?',
    mentionIds: [currentUserId],
    createdAt: now,
  },
  {
    id: 'comment-002',
    workspaceId: 'workspace-brainflow',
    entityType: 'project',
    entityId: 'project-sync',
    authorId: 'user-nia',
    body: 'Dashboard looks ready for the shared project review.',
    mentionIds: [],
    createdAt: now,
  },
];

export const mockMentions: Mention[] = [
  {
    id: 'mention-001',
    workspaceId: 'workspace-brainflow',
    entityType: 'comment',
    entityId: 'comment-001',
    mentionedUserId: currentUserId,
    mentionedBy: 'user-milo',
    createdAt: now,
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'activity-001',
    workspaceId: 'workspace-brainflow',
    entityType: 'task',
    entityId: 'task-001',
    actorId: currentUserId,
    action: 'assigned',
    detail: 'Assigned task to Milo and Nia',
    createdAt: now,
  },
  {
    id: 'activity-002',
    workspaceId: 'workspace-brainflow',
    entityType: 'project',
    entityId: 'project-sync',
    actorId: 'user-nia',
    action: 'followed',
    detail: 'Followed Realtime Collaboration',
    createdAt: now,
  },
];

export const mockWatchers: Watcher[] = [
  {
    id: 'watcher-001',
    workspaceId: 'workspace-brainflow',
    entityType: 'task',
    entityId: 'task-001',
    userId: currentUserId,
    createdAt: now,
  },
  {
    id: 'watcher-002',
    workspaceId: 'workspace-brainflow',
    entityType: 'task',
    entityId: 'task-001',
    userId: 'user-milo',
    createdAt: now,
  },
];
