import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Affiliation } from '../enums/affiliation.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Roronoa Zoro',
    description: 'Nome ou alcunha do tripulante',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'zoro@grandline.hub',
    description: 'E-mail único para acesso à plataforma',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Santoryu@2026',
    description: 'Senha de acesso (mínimo 8 caracteres)',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({
    enum: Affiliation,
    example: Affiliation.PIRATE,
    description: 'Afiliação nos mares',
  })
  @IsEnum(Affiliation)
  affiliation: Affiliation;
}
