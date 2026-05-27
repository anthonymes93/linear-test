export type WorkspaceRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export type WorkspacePlan = 'Personal' | 'Team';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'invite'
  | 'manageBilling'
  | 'manageWorkspaceSettings';

export interface Workspace {
  id: string;
  name: string;
  plan: WorkspacePlan;
  ownerId: string;
  defaultSpaceVisibility: 'Private' | 'Workspace';
  billingReady: boolean;
  settings: {
    domainInvites: boolean;
    guestCommentsOnly: boolean;
    requireApprovalForGuests: boolean;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatarColor: string;
  status: 'Active' | 'Invited' | 'Guest';
  lastActiveAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  status: 'Pending' | 'Accepted' | 'Revoked';
  expiresAt: string;
}

export interface SharedProject {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  visibility: 'Personal' | 'Workspace' | 'Invite-only';
  ownerId: string;
  followerIds: string[];
  taskIds: string[];
  updatedAt: string;
}

export interface CollaborationComment {
  id: string;
  workspaceId: string;
  entityType: 'task' | 'project';
  entityId: string;
  authorId: string;
  body: string;
  mentionIds: string[];
  createdAt: string;
}

export interface Mention {
  id: string;
  workspaceId: string;
  entityType: 'task' | 'project' | 'comment';
  entityId: string;
  mentionedUserId: string;
  mentionedBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  entityType: 'workspace' | 'task' | 'project';
  entityId: string;
  actorId: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface Watcher {
  id: string;
  workspaceId: string;
  entityType: 'task' | 'project';
  entityId: string;
  userId: string;
  createdAt: string;
}
