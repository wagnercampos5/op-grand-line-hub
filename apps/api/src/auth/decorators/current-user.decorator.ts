import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserResponseDto } from '../../users/dto/user-response.dto';

export interface AuthenticatedRequest extends Request {
  user?: UserResponseDto;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserResponseDto => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error('CurrentUser decorator requires JwtAuthGuard');
    }
    return request.user;
  },
);
