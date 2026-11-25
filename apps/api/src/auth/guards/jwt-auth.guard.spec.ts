import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Affiliation } from '../../users/enums/affiliation.enum';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

function createMockExecutionContext(
  authorization?: string,
): { context: ExecutionContext; request: Record<string, unknown> } {
  const request: Record<string, unknown> = {
    headers: authorization ? { authorization } : {},
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtServiceMock: { verifyAsync: jest.Mock };
  let usersServiceMock: { findById: jest.Mock };

  beforeEach(async () => {
    jwtServiceMock = { verifyAsync: jest.fn() };
    usersServiceMock = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('attaches the authenticated user to request and returns true for a valid token', async () => {
    const publicUser = {
      id: 'user-123',
      name: 'Nami',
      email: 'nami@grandline.hub',
      affiliation: Affiliation.PIRATE,
      bounty: 366_000_000,
      createdAt: new Date('2026-11-25T08:00:00.000Z'),
    };
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'user-123',
      email: 'nami@grandline.hub',
    });
    usersServiceMock.findById.mockResolvedValue(publicUser);

    const { context, request } = createMockExecutionContext('Bearer valid.jwt');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid.jwt');
    expect(usersServiceMock.findById).toHaveBeenCalledWith('user-123');
    expect(request.user).toEqual(publicUser);
  });

  it('throws UnauthorizedException when Authorization header is missing or malformed', async () => {
    const { context: missingCtx } = createMockExecutionContext();
    await expect(guard.canActivate(missingCtx)).rejects.toThrow(
      UnauthorizedException,
    );

    const { context: basicCtx } = createMockExecutionContext('Basic abc123');
    await expect(guard.canActivate(basicCtx)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when token verification fails', async () => {
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const { context } = createMockExecutionContext('Bearer invalid.jwt');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when user no longer exists', async () => {
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'deleted-user',
      email: 'deleted@grandline.hub',
    });
    usersServiceMock.findById.mockResolvedValue(null);
    const { context } = createMockExecutionContext('Bearer valid.jwt');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
