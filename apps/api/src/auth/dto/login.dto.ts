import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'zoro@grandline.hub',
    description: 'E-mail cadastrado do tripulante',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Santoryu@2026',
    description: 'Senha de acesso',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
