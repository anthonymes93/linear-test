import type { PermissionAction, WorkspaceRole } from '../types/collaboration';

const rolePermissions: Record<WorkspaceRole, PermissionAction[]> = {
  Owner: ['view', 'create', 'edit', 'delete', 'invite', 'manageBilling', 'manageWorkspaceSettings'],
  Admin: ['view', 'create', 'edit', 'delete', 'invite', 'manageWorkspaceSettings'],
  Member: ['view', 'create', 'edit'],
  Guest: ['view'],
};

export function can(role: WorkspaceRole | undefined, action: PermissionAction) {
  return role ? rolePermissions[role].includes(action) : false;
}

export const permissionMatrix = rolePermissions;
