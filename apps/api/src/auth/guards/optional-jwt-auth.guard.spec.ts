import type { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Affiliation } from '../../users/enums/affiliation.enum';
import { UsersService } from '../../users/users.service';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let usersService: { findById: jest.Mock };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    usersService = { findById: jest.fn() };
    guard = new OptionalJwtAuthGuard(
      jwtService as unknown as JwtService,
      usersService as unknown as UsersService,
    );
  });

  function createContext(authHeader?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = {
      headers: authHeader ? { authorization: authHeader } : {},
    } as AuthenticatedRequest;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it('allows anonymous visitors when Authorization header is absent', async () => {
    const { context, request } = createContext();

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(request.user).toBeUndefined();
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('hydrates request.user when Bearer token is valid', async () => {
    const mockUser = {
      id: '11111111-1111-4111-8111-111111111101',
      name: 'Nico Robin',
      email: 'nico.robin@ohara.gl',
      affiliation: Affiliation.PIRATE,
      bounty: 930_000_000,
      createdAt: new Date(),
    };
    jwtService.verifyAsync.mockResolvedValue({
      sub: mockUser.id,
      email: mockUser.email,
    });
    usersService.findById.mockResolvedValue(mockUser);

    const { context, request } = createContext('Bearer valid-jwt-token');
    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(request.user).toEqual(mockUser);
  });

  it('falls back gracefully to anonymous when Bearer token is expired or invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const { context, request } = createContext('Bearer expired-token');
    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(request.user).toBeUndefined();
  });
});
