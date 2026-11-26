import { ApiProperty } from '@nestjs/swagger';
import {
  AuthorSummaryDto,
  toAuthorSummary,
  type AuthorPublicRecord,
} from '../../common/dto/author-summary.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ContractStatus } from '../enums/contract-status.enum';
import { ContractType } from '../enums/contract-type.enum';
import { Sea } from '../enums/sea.enum';

export interface ContractHydratedRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  reward: bigint;
  sea: string;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorPublicRecord;
}

export class ContractResponseDto {
  @ApiProperty({
    example: '44444444-4444-4444-8444-444444444404',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Especialista em Log Pose Triplo para Expedição Submarina',
  })
  title: string;

  @ApiProperty({
    example:
      'O Polar Tang busca navegador auxiliar com experiência em correntes térmicas profundas do Novo Mundo.',
  })
  description: string;

  @ApiProperty({
    enum: ContractType,
    example: ContractType.CREW_RECRUITMENT,
  })
  type: ContractType;

  @ApiProperty({
    example: 120000000,
    description: 'Recompensa em Berries (convertida de BigInt)',
  })
  reward: number;

  @ApiProperty({ enum: Sea, example: Sea.NEW_WORLD })
  sea: Sea;

  @ApiProperty({ enum: ContractStatus, example: ContractStatus.OPEN })
  status: ContractStatus;

  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111106',
    format: 'uuid',
  })
  authorId: string;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;

  @ApiProperty({ example: '2026-11-24T15:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-24T15:30:00.000Z' })
  updatedAt: Date;
}

export class PaginatedContractsResponseDto {
  @ApiProperty({ type: [ContractResponseDto] })
  data: ContractResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export function toContractResponse(
  contract: ContractHydratedRecord,
): ContractResponseDto {
  return {
    id: contract.id,
    title: contract.title,
    description: contract.description,
    type: contract.type as ContractType,
    reward: Number(contract.reward),
    sea: contract.sea as Sea,
    status: contract.status as ContractStatus,
    authorId: contract.authorId,
    author: toAuthorSummary(contract.author),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  };
}
