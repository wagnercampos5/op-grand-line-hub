import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { Affiliation } from '../users/enums/affiliation.enum';
import { ContractsService } from './contracts.service';
import { ContractStatus } from './enums/contract-status.enum';
import { ContractType } from './enums/contract-type.enum';
import { Sea } from './enums/sea.enum';

const LUFFY_AUTHOR = {
  id: '11111111-1111-4111-8111-111111111102',
  name: 'Monkey D. Luffy',
  affiliation: Affiliation.PIRATE,
  bounty: 3_000_000_000n,
};

function buildContractRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '44444444-4444-4444-8444-444444444401',
    title: 'Procura-se Músico para o Thousand Sunny',
    description: 'Necessário saber tocar Binks no Sake rumo ao Novo Mundo.',
    type: ContractType.CREW_RECRUITMENT,
    reward: 3_000_000_000n,
    sea: Sea.NEW_WORLD,
    status: ContractStatus.OPEN,
    authorId: LUFFY_AUTHOR.id,
    createdAt: new Date('2026-11-25T07:00:00.000Z'),
    updatedAt: new Date('2026-11-25T07:00:00.000Z'),
    author: LUFFY_AUTHOR,
    ...overrides,
  };
}

describe('ContractsService', () => {
  let service: ContractsService;
  let prismaMock: {
    contract: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      contract: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('lists contracts filtering by sea and type and converts BigInt reward > 32-bit safely', async () => {
    prismaMock.contract.findMany.mockResolvedValue([buildContractRow()]);
    prismaMock.contract.count.mockResolvedValue(1);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      sea: Sea.NEW_WORLD,
      type: ContractType.CREW_RECRUITMENT,
    });

    expect(prismaMock.contract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          sea: Sea.NEW_WORLD,
          type: ContractType.CREW_RECRUITMENT,
        },
      }),
    );
    expect(result.data[0].reward).toBe(3_000_000_000);
    expect(result.data[0].author.bounty).toBe(3_000_000_000);
    expect(result.data[0].author).not.toHaveProperty('passwordHash');
  });

  it('executes PostgreSQL full-text search ($queryRaw) when search term is provided', async () => {
    const id = '44444444-4444-4444-8444-444444444401';
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ id }])
      .mockResolvedValueOnce([{ count: 1n }]);
    prismaMock.contract.findMany.mockResolvedValue([buildContractRow()]);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      search: 'Músico',
      sea: Sea.NEW_WORLD,
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
    expect(result.meta.total).toBe(1);
    expect(result.data[0].id).toBe(id);
  });

  it('creates a new contract with initial OPEN status and BigInt reward', async () => {
    prismaMock.contract.create.mockResolvedValue(
      buildContractRow({ reward: 450_000_000n }),
    );

    const created = await service.create(
      {
        title: 'Procura-se Músico para o Thousand Sunny',
        description: 'Necessário saber tocar Binks no Sake rumo ao Novo Mundo.',
        type: ContractType.CREW_RECRUITMENT,
        reward: 450_000_000,
        sea: Sea.NEW_WORLD,
      },
      LUFFY_AUTHOR.id,
    );

    expect(prismaMock.contract.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reward: 450_000_000n,
          status: ContractStatus.OPEN,
          authorId: LUFFY_AUTHOR.id,
        }),
      }),
    );
    expect(created.reward).toBe(450_000_000);
  });

  it('allows only the contract author to update status (403 for others, 404 when missing)', async () => {
    const contractId = '44444444-4444-4444-8444-444444444401';

    prismaMock.contract.findUnique.mockResolvedValueOnce({
      id: contractId,
      authorId: LUFFY_AUTHOR.id,
    });
    prismaMock.contract.update.mockResolvedValueOnce(
      buildContractRow({ status: ContractStatus.COMPLETED }),
    );

    const updated = await service.updateStatus(
      contractId,
      { status: ContractStatus.COMPLETED },
      LUFFY_AUTHOR.id,
    );
    expect(updated.status).toBe(ContractStatus.COMPLETED);

    prismaMock.contract.findUnique.mockResolvedValueOnce({
      id: contractId,
      authorId: LUFFY_AUTHOR.id,
    });
    await expect(
      service.updateStatus(
        contractId,
        { status: ContractStatus.IN_PROGRESS },
        '99999999-9999-4999-8999-999999999999',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    prismaMock.contract.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.updateStatus(
        '00000000-0000-4000-8000-000000000000',
        { status: ContractStatus.COMPLETED },
        LUFFY_AUTHOR.id,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
