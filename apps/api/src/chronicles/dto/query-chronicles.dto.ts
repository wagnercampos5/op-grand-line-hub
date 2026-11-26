import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ChronicleCategory } from '../enums/chronicle-category.enum';

export class QueryChroniclesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ChronicleCategory,
    description: 'Filtrar crônicas por categoria temática',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  @IsOptional()
  @IsEnum(ChronicleCategory)
  category?: ChronicleCategory;
}
