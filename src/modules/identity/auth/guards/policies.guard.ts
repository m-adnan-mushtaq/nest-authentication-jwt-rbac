import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@/entities/user.entity';
import { PERMISSIONS_KEY } from '@/common/decorators/permission.decorator';
import {
  hasPermission,
  Permission,
} from '@/common/constants/permissions.constant';
import { SystemRole } from '@/common/constants/enums';

/**
 * Guard that checks if user has required permissions based on their role
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const activeRole = user.activeRole as SystemRole;

    if (!activeRole) {
      throw new ForbiddenException(
        'No active role found for user',
      );
    }

    if (activeRole === SystemRole.ADMIN) {
      return true;
    }

    const isAllowed = requiredPermissions.every((permission) => {
      const [module, action] = permission.split(':');
      return hasPermission(activeRole, module, action as Permission);
    });

    if (!isAllowed) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
