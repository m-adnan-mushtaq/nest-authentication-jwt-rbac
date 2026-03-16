import { SystemRole } from './enums';

/**
 * RBAC Permissions Dictionary
 * Defines what actions each role can perform on each module
 */

export type Permission = 'create' | 'read' | 'update' | 'delete';

export interface ModulePermissions {
  [module: string]: Permission[];
}

const CRUD: Permission[] = ['create', 'read', 'update', 'delete'];
const CRU: Permission[] = ['create', 'read', 'update'];
const R: Permission[] = ['read'];

export const ROLE_PERMISSIONS: Record<SystemRole, ModulePermissions> = {
  [SystemRole.ADMIN]: {
    users: CRUD,
    products: CRUD,
    auditLogs: R,
    roles: R,
  },

  [SystemRole.USER]: {
    products: R,
  },
};

/**
 * Get permissions for a specific role
 * @param role System role
 * @returns Module permissions
 */
export function getPermissionsForRole(role: SystemRole): ModulePermissions {
  return ROLE_PERMISSIONS[role] || {};
}

/**
 * Check if role has permission for a module action
 * @param role System role
 * @param module Module name
 * @param action Action to check
 * @returns Boolean
 */
export function hasPermission(
  role: SystemRole,
  module: string,
  action: Permission,
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;

  const modulePermissions = rolePermissions[module];
  if (!modulePermissions) return false;

  return modulePermissions.includes(action);
}

/**
 * Get all accessible modules for a role
 * @param role System role
 * @returns Array of module names
 */
export function getAccessibleModules(role: SystemRole): string[] {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return [];

  return Object.keys(rolePermissions);
}

/**
 * Check if role can access a module (has any permission)
 * @param role System role
 * @param module Module name
 * @returns Boolean
 */
export function canAccessModule(role: SystemRole, module: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;

  return module in rolePermissions && rolePermissions[module].length > 0;
}
