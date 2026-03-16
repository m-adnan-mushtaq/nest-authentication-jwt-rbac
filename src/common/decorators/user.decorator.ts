import { User as UserEntity } from '@/entities/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LoggedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
  },
);

// Alias for LoggedUser - more intuitive naming
export const CurrentUser = LoggedUser;
