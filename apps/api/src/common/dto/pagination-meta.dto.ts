import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Página atual (1-based)' })
  page: number;

  @ApiProperty({ example: 10, description: 'Quantidade de itens por página' })
  limit: number;

  @ApiProperty({ example: 42, description: 'Total de registros encontrados' })
  total: number;

  @ApiProperty({ example: 5, description: 'Total de páginas disponíveis' })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMetaDto {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
