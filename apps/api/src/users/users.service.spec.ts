import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Affiliation } from './enums/affiliation.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'BCRYPT_SALT_ROUNDS' ? 4 : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('hashes the password with bcrypt, normalizes fields, and omits passwordHash from the response', async () => {
      const createdAt = new Date('2026-11-25T08:00:00.000Z');
      prismaMock.user.create.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Roronoa Zoro',
        email: 'zoro@grandline.hub',
        affiliation: Affiliation.PIRATE,
        bounty: 0n,
        createdAt,
      });

      const result = await service.create({
        name: '  Roronoa Zoro  ',
        email: '  ZORO@GrandLine.Hub  ',
        password: 'Santoryu@2026',
        affiliation: Affiliation.PIRATE,
      });

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      const createCallArg = prismaMock.user.create.mock.calls[0][0] as {
        data: {
          name: string;
          email: string;
          passwordHash: string;
          affiliation: Affiliation;
        };
        select: Record<string, boolean>;
      };

      expect(createCallArg.data.name).toBe('Roronoa Zoro');
      expect(createCallArg.data.email).toBe('zoro@grandline.hub');
      expect(createCallArg.data.affiliation).toBe(Affiliation.PIRATE);
      expect(createCallArg.data.passwordHash).not.toBe('Santoryu@2026');
      await expect(
        bcrypt.compare('Santoryu@2026', createCallArg.data.passwordHash),
      ).resolves.toBe(true);
      expect(createCallArg.select).not.toHaveProperty('passwordHash');

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Roronoa Zoro',
        email: 'zoro@grandline.hub',
        affiliation: Affiliation.PIRATE,
        bounty: 0,
        createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException when email already exists (P2002)', async () => {
      prismaMock.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.create({
          name: 'Nami',
          email: 'nami@grandline.hub',
          password: 'Tangerine@2026',
          affiliation: Affiliation.PIRATE,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('returns public user profile with bounty converted to number', async () => {
      const createdAt = new Date('2026-11-25T08:00:00.000Z');
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Monkey D. Luffy',
        email: 'luffy@grandline.hub',
        affiliation: Affiliation.PIRATE,
        bounty: 3_000_000_000n,
        createdAt,
      });

      const result = await service.findById('user-1');

      expect(result).toEqual({
        id: 'user-1',
        name: 'Monkey D. Luffy',
        email: 'luffy@grandline.hub',
        affiliation: Affiliation.PIRATE,
        bounty: 3_000_000_000,
        createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns null when user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing-id')).resolves.toBeNull();
    });
  });
});
