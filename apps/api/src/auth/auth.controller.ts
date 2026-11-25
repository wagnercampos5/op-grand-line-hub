import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e emitir token JWT' })
  @ApiOkResponse({
    description: 'Autenticação realizada com sucesso.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Formato de credenciais inválido.' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha inválidos.' })
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiOkResponse({
    description: 'Perfil do usuário autenticado (sem hash de senha).',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado.' })
  getProfile(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }
}
