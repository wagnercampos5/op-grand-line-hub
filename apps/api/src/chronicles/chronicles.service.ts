import { Injectable, NotFoundException } from '@nestjs/common';
import { AUTHOR_PUBLIC_SELECT } from '../common/dto/author-summary.dto';
import { buildPaginationMeta } from '../common/dto/pagination-meta.dto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ChronicleLikeResponseDto } from './dto/chronicle-like-response.dto';
import {
  toChronicleResponse,
  type ChronicleHydratedRecord,
  type ChronicleResponseDto,
  type PaginatedChroniclesResponseDto,
} from './dto/chronicle-response.dto';
import {
  toCommentResponse,
  type CommentRecord,
  type CommentResponseDto,
} from './dto/comment-response.dto';
import type { CreateChronicleDto } from './dto/create-chronicle.dto';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { QueryChroniclesDto } from './dto/query-chronicles.dto';

function escapeLikePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`;
}

function buildChronicleSelect(currentUserId?: string) {
  return {
    id: true,
    title: true,
    content: true,
    category: true,
    coverUrl: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: AUTHOR_PUBLIC_SELECT,
    },
    comments: {
      orderBy: { createdAt: 'asc' as const },
      select: {
        id: true,
        content: true,
        chronicleId: true,
        createdAt: true,
        author: {
          select: AUTHOR_PUBLIC_SELECT,
        },
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    ...(currentUserId
      ? {
          likes: {
            where: { userId: currentUserId },
            select: { userId: true },
          },
        }
      : {}),
  };
}

@Injectable()
export class ChroniclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryChroniclesDto,
    currentUserId?: string,
  ): Promise<PaginatedChroniclesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.search?.trim();

    if (searchTerm) {
      return this.findAllWithFullTextSearch(
        {
          page,
          limit,
          skip,
          searchTerm,
          category: query.category,
        },
        currentUserId,
      );
    }

    const where = query.category ? { category: query.category } : {};

    const [rows, total] = await Promise.all([
      this.prisma.chronicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: buildChronicleSelect(currentUserId),
      }),
      this.prisma.chronicle.count({ where }),
    ]);

    return {
      data: (rows as ChronicleHydratedRecord[]).map(toChronicleResponse),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private async findAllWithFullTextSearch(
    params: {
      page: number;
      limit: number;
      skip: number;
      searchTerm: string;
      category?: QueryChroniclesDto['category'];
    },
    currentUserId?: string,
  ): Promise<PaginatedChroniclesResponseDto> {
    const { page, limit, skip, searchTerm, category } = params;
    const likePattern = escapeLikePattern(searchTerm);

    const categoryFilterSql = category
      ? Prisma.sql`AND c."category" = ${category}::"ChronicleCategory"`
      : Prisma.empty;

    const searchVectorSql = Prisma.sql`(
      setweight(to_tsvector('portuguese', coalesce(c."title", '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(c."content", '')), 'B')
    )`;
    const tsQuerySql = Prisma.sql`websearch_to_tsquery('portuguese', ${searchTerm})`;

    const whereSql = Prisma.sql`
      (
        ${searchVectorSql} @@ ${tsQuerySql}
        OR c."title" ILIKE ${likePattern}
        OR c."content" ILIKE ${likePattern}
      )
      ${categoryFilterSql}
    `;

    const [matchedIds, countResult] = await Promise.all([
      this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT c."id"
        FROM "chronicles" c
        WHERE ${whereSql}
        ORDER BY
          ts_rank(${searchVectorSql}, ${tsQuerySql}) DESC,
          c."created_at" DESC
        LIMIT ${limit} OFFSET ${skip}
      `),
      this.prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "count"
        FROM "chronicles" c
        WHERE ${whereSql}
      `),
    ]);

    const total = Number(countResult[0]?.count ?? 0n);

    if (matchedIds.length === 0) {
      return {
        data: [],
        meta: buildPaginationMeta(page, limit, total),
      };
    }

    const orderedIds = matchedIds.map((row) => row.id);
    const hydratedRows = await this.prisma.chronicle.findMany({
      where: { id: { in: orderedIds } },
      select: buildChronicleSelect(currentUserId),
    });

    const rowById = new Map(
      (hydratedRows as ChronicleHydratedRecord[]).map((row) => [row.id, row]),
    );
    const orderedChronicles = orderedIds
      .map((id) => rowById.get(id))
      .filter((row): row is ChronicleHydratedRecord => Boolean(row))
      .map(toChronicleResponse);

    return {
      data: orderedChronicles,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async create(
    createChronicleDto: CreateChronicleDto,
    authorId: string,
  ): Promise<ChronicleResponseDto> {
    const created = await this.prisma.chronicle.create({
      data: {
        title: createChronicleDto.title.trim(),
        content: createChronicleDto.content.trim(),
        category: createChronicleDto.category,
        coverUrl: createChronicleDto.coverUrl ?? null,
        authorId,
      },
      select: buildChronicleSelect(authorId),
    });

    return toChronicleResponse(created as ChronicleHydratedRecord);
  }

  async like(
    chronicleId: string,
    userId: string,
  ): Promise<ChronicleLikeResponseDto> {
    await this.ensureChronicleExists(chronicleId);

    await this.prisma.chronicleLike.upsert({
      where: {
        chronicleId_userId: {
          chronicleId,
          userId,
        },
      },
      update: {},
      create: {
        chronicleId,
        userId,
      },
    });

    const likesCount = await this.prisma.chronicleLike.count({
      where: { chronicleId },
    });

    return {
      chronicleId,
      liked: true,
      likesCount,
    };
  }

  async unlike(
    chronicleId: string,
    userId: string,
  ): Promise<ChronicleLikeResponseDto> {
    await this.ensureChronicleExists(chronicleId);

    await this.prisma.chronicleLike.deleteMany({
      where: {
        chronicleId,
        userId,
      },
    });

    const likesCount = await this.prisma.chronicleLike.count({
      where: { chronicleId },
    });

    return {
      chronicleId,
      liked: false,
      likesCount,
    };
  }

  async findComments(chronicleId: string): Promise<CommentResponseDto[]> {
    await this.ensureChronicleExists(chronicleId);

    const comments: CommentRecord[] = await this.prisma.comment.findMany({
      where: { chronicleId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        chronicleId: true,
        createdAt: true,
        author: {
          select: AUTHOR_PUBLIC_SELECT,
        },
      },
    });

    return comments.map(toCommentResponse);
  }

  async addComment(
    chronicleId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentResponseDto> {
    await this.ensureChronicleExists(chronicleId);

    const comment: CommentRecord = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content.trim(),
        chronicleId,
        authorId,
      },
      select: {
        id: true,
        content: true,
        chronicleId: true,
        createdAt: true,
        author: {
          select: AUTHOR_PUBLIC_SELECT,
        },
      },
    });

    return toCommentResponse(comment);
  }

  private async ensureChronicleExists(chronicleId: string): Promise<void> {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { id: true },
    });

    if (!chronicle) {
      throw new NotFoundException('Crônica não encontrada.');
    }
  }
}
