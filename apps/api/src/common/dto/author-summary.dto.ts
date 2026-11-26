import { ApiProperty } from '@nestjs/swagger';
import { Affiliation } from '../../users/enums/affiliation.enum';

export const AUTHOR_PUBLIC_SELECT = {
  id: true,
  name: true,
  affiliation: true,
  bounty: true,
} as const;

export interface AuthorPublicRecord {
  id: string;
  name: string;
  affiliation: string;
  bounty: bigint;
}

export class AuthorSummaryDto {
  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111101',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Nico Robin' })
  name: string;

  @ApiProperty({ enum: Affiliation, example: Affiliation.PIRATE })
  affiliation: Affiliation;

  @ApiProperty({
    example: 930000000,
    description: 'Recompensa atual do autor em Berries',
  })
  bounty: number;
}

export function toAuthorSummary(author: AuthorPublicRecord): AuthorSummaryDto {
  return {
    id: author.id,
    name: author.name,
    affiliation: author.affiliation as Affiliation,
    bounty: Number(author.bounty),
  };
}
