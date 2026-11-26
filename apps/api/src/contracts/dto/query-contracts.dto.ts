import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ContractStatus } from '../enums/contract-status.enum';
import { ContractType } from '../enums/contract-type.enum';
import { Sea } from '../enums/sea.enum';

function emptyStringToUndefined({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export class QueryContractsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: Sea,
    description: 'Filtrar contratos por região marítima',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(Sea)
  sea?: Sea;

  @ApiPropertyOptional({
    enum: ContractType,
    description: 'Filtrar contratos por modalidade (recrutamento ou caçada)',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @ApiPropertyOptional({
    enum: ContractStatus,
    description: 'Filtrar contratos por status de andamento',
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
