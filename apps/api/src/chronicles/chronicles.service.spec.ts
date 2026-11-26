import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { Affiliation } from '../users/enums/affiliation.enum';
import { ChroniclesService } from './chronicles.service';
import { ChronicleCategory } from './enums/chronicle-category.enum';

const SAMPLE_AUTHOR = {
  id: '11111111-1111-4111-8111-111111111101',
  name: 'Nico Robin',
  affiliation: Affiliation.PIRATE,
  bounty: 930_000_000n,
};

function buildChronicleRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222201',
    title: 'Inscrições em Poneglyphs Submersos',
    content: 'Registros ancestrais encontrados sob as galerias de Water 7.',
    category: ChronicleCategory.VOID_CENTURY,
    coverUrl: null,
    authorId: SAMPLE_AUTHOR.id,
    createdAt: new Date('2026-11-20T10:30:00.000Z'),
    updatedAt: new Date('2026-11-20T10:30:00.000Z'),
    author: SAMPLE_AUTHOR,
    comments: [],
    _count: {
      likes: 3,
      comments: 0,
    },
    ...overrides,
  };
}

describe('ChroniclesService', () => {
  let service: ChroniclesService;
  let prismaMock: {
    chronicle: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
    };
    chronicleLike: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      count: jest.Mock;
    };
    comment: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      chronicle: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      chronicleLike: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      comment: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChroniclesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ChroniclesService>(ChroniclesService);
  });

  it('lists paginated chronicles without passwordHash and maps likedByMe accurately', async () => {
    prismaMock.chronicle.findMany.mockResolvedValue([
      buildChronicleRow({ likes: [{ userId: SAMPLE_AUTHOR.id }] }),
    ]);
    prismaMock.chronicle.count.mockResolvedValue(1);

    const result = await service.findAll(
      { page: 1, limit: 10 },
      SAMPLE_AUTHOR.id,
    );

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(result.data[0].likedByMe).toBe(true);
    expect(result.data[0].author.bounty).toBe(930_000_000);
    expect(result.data[0].author).not.toHaveProperty('passwordHash');
  });

  it('uses PostgreSQL full-text search ($queryRaw) and preserves rank ordering when search is given', async () => {
    const idFirst = '22222222-2222-4222-8222-222222222206';
    const idSecond = '22222222-2222-4222-8222-222222222201';

    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ id: idFirst }, { id: idSecond }])
      .mockResolvedValueOnce([{ count: 2n }]);

    prismaMock.chronicle.findMany.mockResolvedValue([
      buildChronicleRow({ id: idSecond, title: 'Segundo por relevância' }),
      buildChronicleRow({ id: idFirst, title: 'Primeiro por relevância' }),
    ]);

    const result = await service.findAll({
      page: 1,
      limit: 10,
      search: 'Poneglyph',
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
    expect(result.meta.total).toBe(2);
    expect(result.data.map((item) => item.id)).toEqual([idFirst, idSecond]);
  });

  it('creates a chronicle with optional coverUrl omitted -> null', async () => {
    prismaMock.chronicle.create.mockResolvedValue(buildChronicleRow());

    const created = await service.create(
      {
        title: 'Inscrições em Poneglyphs Submersos',
        content: 'Registros ancestrais encontrados sob as galerias de Water 7.',
        category: ChronicleCategory.VOID_CENTURY,
      },
      SAMPLE_AUTHOR.id,
    );

    expect(prismaMock.chronicle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          coverUrl: null,
          authorId: SAMPLE_AUTHOR.id,
        }),
      }),
    );
    expect(created.coverUrl).toBeNull();
  });

  it('likes and unlikes an existing chronicle idempotently and throws 404 when missing', async () => {
    prismaMock.chronicle.findUnique.mockResolvedValueOnce({
      id: '22222222-2222-4222-8222-222222222201',
    });
    prismaMock.chronicleLike.upsert.mockResolvedValue({});
    prismaMock.chronicleLike.count.mockResolvedValueOnce(4);

    const liked = await service.like(
      '22222222-2222-4222-8222-222222222201',
      SAMPLE_AUTHOR.id,
    );
    expect(liked).toEqual({
      chronicleId: '22222222-2222-4222-8222-222222222201',
      liked: true,
      likesCount: 4,
    });

    prismaMock.chronicle.findUnique.mockResolvedValueOnce({
      id: '22222222-2222-4222-8222-222222222201',
    });
    prismaMock.chronicleLike.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.chronicleLike.count.mockResolvedValueOnce(3);

    const unliked = await service.unlike(
      '22222222-2222-4222-8222-222222222201',
      SAMPLE_AUTHOR.id,
    );
    expect(unliked.liked).toBe(false);
    expect(unliked.likesCount).toBe(3);

    prismaMock.chronicle.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.like('00000000-0000-4000-8000-000000000000', SAMPLE_AUTHOR.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adds a comment to an existing chronicle and throws 404 if chronicle does not exist', async () => {
    const chronicleId = '22222222-2222-4222-8222-222222222201';
    prismaMock.chronicle.findUnique.mockResolvedValueOnce({ id: chronicleId });
    prismaMock.comment.create.mockResolvedValue({
      id: '33333333-3333-4333-8333-333333333301',
      content: 'Registro histórico valioso!',
      chronicleId,
      createdAt: new Date('2026-11-20T12:00:00.000Z'),
      author: SAMPLE_AUTHOR,
    });

    const comment = await service.addComment(
      chronicleId,
      { content: '  Registro histórico valioso!  ' },
      SAMPLE_AUTHOR.id,
    );

    expect(comment.content).toBe('Registro histórico valioso!');
    expect(comment.author.name).toBe('Nico Robin');

    prismaMock.chronicle.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.addComment(
        '00000000-0000-4000-8000-000000000000',
        { content: 'Teste' },
        SAMPLE_AUTHOR.id,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
