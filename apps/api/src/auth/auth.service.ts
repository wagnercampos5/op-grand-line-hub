import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

// Valid bcrypt hash used when email is not found to keep response timing uniform.
const DUMMY_PASSWORD_HASH =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8N8Qv6q0Z6v8Q1w5y1w6Y1z7K8m9O2';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
