import { JwtAuthGuard } from '@/modules/identity/auth/guards/local-auth.guard';
import { PermissionsGuard } from '@/modules/identity/auth/guards/policies.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { Permissions } from './permission.decorator';

/**
 * Auth decorator that combines JWT authentication with optional permission checking
 * @param permissions - Array of permission strings in format 'module:action' (e.g., 'sponsors:read')
 */
export function Auth(...permissions: string[]) {
  const requiresPermissions = permissions.length > 0;

  return applyDecorators(
    ApiSecurity('bearer'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    ...(requiresPermissions
      ? [UseGuards(PermissionsGuard), Permissions(...permissions)]
      : []),
  );
}
