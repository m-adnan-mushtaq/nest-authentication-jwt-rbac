import { SetMetadata } from '@nestjs/common';

/**
 * Permission format: 'module:action'
 * Examples: 'sponsors:read', 'sponsors:create', 'users:update'
 */
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
