import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ContractType } from '../enums/contract-type.enum';
import { Sea } from '../enums/sea.enum';

export class CreateContractDto {
  @ApiProperty({
    example: 'Procura-se Navegador com Experiência no Novo Mundo',
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
      'Buscamos especialista em Log Pose Triplo capaz de ler correntes térmicas e evitar ciclones repentinos.',
    minLength: 10,
    maxLength: 3000,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(3000)
  description: string;

  @ApiProperty({
    enum: ContractType,
    example: ContractType.CREW_RECRUITMENT,
  })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiProperty({
    example: 120000000,
    minimum: 0,
    description:
      'Recompensa ou bônus de alistamento em Berries (persistido como BigInt)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  reward: number;

  @ApiProperty({
    enum: Sea,
    example: Sea.NEW_WORLD,
  })
  @IsEnum(Sea)
  sea: Sea;
}
