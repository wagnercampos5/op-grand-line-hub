import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserResponseDto } from '../../users/dto/user-response.dto';
import type { AuthenticatedRequest } from './current-user.decorator';

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserResponseDto | undefined => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
