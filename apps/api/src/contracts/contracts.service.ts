import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AUTHOR_PUBLIC_SELECT } from '../common/dto/author-summary.dto';
import { buildPaginationMeta } from '../common/dto/pagination-meta.dto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  toContractResponse,
  type ContractHydratedRecord,
  type ContractResponseDto,
  type PaginatedContractsResponseDto,
} from './dto/contract-response.dto';
import type { CreateContractDto } from './dto/create-contract.dto';
import type { QueryContractsDto } from './dto/query-contracts.dto';
import type { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { ContractStatus } from './enums/contract-status.enum';

const CONTRACT_PUBLIC_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  reward: true,
  sea: true,
  status: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: AUTHOR_PUBLIC_SELECT,
  },
} as const;

function escapeLikePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`;
}

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryContractsDto,
  ): Promise<PaginatedContractsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const searchTerm = query.search?.trim();

    if (searchTerm) {
      return this.findAllWithFullTextSearch({
        page,
        limit,
        skip,
        searchTerm,
        sea: query.sea,
        type: query.type,
        status: query.status,
      });
    }

    const where = {
      ...(query.sea ? { sea: query.sea } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: CONTRACT_PUBLIC_SELECT,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data: (rows as ContractHydratedRecord[]).map(toContractResponse),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  private async findAllWithFullTextSearch(params: {
    page: number;
    limit: number;
    skip: number;
    searchTerm: string;
    sea?: QueryContractsDto['sea'];
    type?: QueryContractsDto['type'];
    status?: QueryContractsDto['status'];
  }): Promise<PaginatedContractsResponseDto> {
    const { page, limit, skip, searchTerm, sea, type, status } = params;
    const likePattern = escapeLikePattern(searchTerm);

    const seaFilterSql = sea
      ? Prisma.sql`AND ct."sea" = ${sea}::"Sea"`
      : Prisma.empty;
    const typeFilterSql = type
      ? Prisma.sql`AND ct."type" = ${type}::"ContractType"`
      : Prisma.empty;
    const statusFilterSql = status
      ? Prisma.sql`AND ct."status" = ${status}::"ContractStatus"`
      : Prisma.empty;

    const searchVectorSql = Prisma.sql`(
      setweight(to_tsvector('portuguese', coalesce(ct."title", '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(ct."description", '')), 'B')
    )`;
    const tsQuerySql = Prisma.sql`websearch_to_tsquery('portuguese', ${searchTerm})`;

    const whereSql = Prisma.sql`
      (
        ${searchVectorSql} @@ ${tsQuerySql}
        OR ct."title" ILIKE ${likePattern}
        OR ct."description" ILIKE ${likePattern}
      )
      ${seaFilterSql}
      ${typeFilterSql}
      ${statusFilterSql}
    `;

    const [matchedIds, countResult] = await Promise.all([
      this.prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT ct."id"
        FROM "contracts" ct
        WHERE ${whereSql}
        ORDER BY
          ts_rank(${searchVectorSql}, ${tsQuerySql}) DESC,
          ct."created_at" DESC
        LIMIT ${limit} OFFSET ${skip}
      `),
      this.prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "count"
        FROM "contracts" ct
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
    const hydratedRows = await this.prisma.contract.findMany({
      where: { id: { in: orderedIds } },
      select: CONTRACT_PUBLIC_SELECT,
    });

    const rowById = new Map(
      (hydratedRows as ContractHydratedRecord[]).map((row) => [row.id, row]),
    );
    const orderedContracts = orderedIds
      .map((id) => rowById.get(id))
      .filter((row): row is ContractHydratedRecord => Boolean(row))
      .map(toContractResponse);

    return {
      data: orderedContracts,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async create(
    createContractDto: CreateContractDto,
    authorId: string,
  ): Promise<ContractResponseDto> {
    const created: ContractHydratedRecord = await this.prisma.contract.create({
      data: {
        title: createContractDto.title.trim(),
        description: createContractDto.description.trim(),
        type: createContractDto.type,
        reward: BigInt(createContractDto.reward),
        sea: createContractDto.sea,
        status: ContractStatus.OPEN,
        authorId,
      },
      select: CONTRACT_PUBLIC_SELECT,
    });

    return toContractResponse(created);
  }

  async updateStatus(
    contractId: string,
    updateDto: UpdateContractStatusDto,
    currentUserId: string,
  ): Promise<ContractResponseDto> {
    const existing = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Contrato não encontrado.');
    }

    if (existing.authorId !== currentUserId) {
      throw new ForbiddenException(
        'Apenas o autor do contrato pode atualizar seu status.',
      );
    }

    const updated: ContractHydratedRecord = await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: updateDto.status },
      select: CONTRACT_PUBLIC_SELECT,
    });

    return toContractResponse(updated);
  }
}
