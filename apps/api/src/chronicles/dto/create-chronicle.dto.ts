import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ChronicleCategory } from '../enums/chronicle-category.enum';

export class CreateChronicleDto {
  @ApiProperty({
    example: 'Inscrições em Poneglyphs Submersos sob Water 7',
    minLength: 3,
    maxLength: 150,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example:
      'Durante o recuo anual da Aqua Laguna, galerias submersas revelaram glifos ancestrais do Século Perdido...',
    minLength: 10,
    maxLength: 5000,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    enum: ChronicleCategory,
    example: ChronicleCategory.VOID_CENTURY,
  })
  @IsEnum(ChronicleCategory)
  category: ChronicleCategory;

  @ApiPropertyOptional({
    example: 'http://localhost:5173/banner-login.jpg',
    description: 'URL opcional de ilustração de capa (http/https)',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(500)
  coverUrl?: string;
}
