import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: {
    findByEmailWithPassword: jest.Mock;
  };
  let jwtServiceMock: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    usersServiceMock = {
      findByEmailWithPassword: jest.fn(),
    };
    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns access_token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('Santoryu@2026', 4);
    usersServiceMock.findByEmailWithPassword.mockResolvedValue({
      id: 'user-123',
      email: 'zoro@grandline.hub',
      passwordHash,
    });
    jwtServiceMock.signAsync.mockResolvedValue('signed.jwt.token');

    const result = await service.login({
      email: 'zoro@grandline.hub',
      password: 'Santoryu@2026',
    });

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'zoro@grandline.hub',
    });
    expect(result).toEqual({ access_token: 'signed.jwt.token' });
  });

  it('throws UnauthorizedException when password does not match', async () => {
    const passwordHash = await bcrypt.hash('Santoryu@2026', 4);
    usersServiceMock.findByEmailWithPassword.mockResolvedValue({
      id: 'user-123',
      email: 'zoro@grandline.hub',
      passwordHash,
    });

    await expect(
      service.login({
        email: 'zoro@grandline.hub',
        password: 'WrongPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when user is not found', async () => {
    usersServiceMock.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@grandline.hub',
        password: 'SomePassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });
});
