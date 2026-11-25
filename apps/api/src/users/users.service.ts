import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  toUserResponse,
  type UserPublicRecord,
  type UserResponseDto,
} from './dto/user-response.dto';

export interface UserCredentialsRecord {
  id: string;
  email: string;
  passwordHash: string;
}

const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  affiliation: true,
  bounty: true,
  createdAt: true,
} as const;

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

@Injectable()
export class UsersService {
  private readonly saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 10;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    const normalizedName = createUserDto.name.trim();
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    try {
      const createdUser: UserPublicRecord = await this.prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
          affiliation: createUserDto.affiliation,
        },
        select: USER_PUBLIC_SELECT,
      });

      return toUserResponse(createdUser);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'Já existe um tripulante cadastrado com este e-mail.',
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user: UserPublicRecord | null = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    return user ? toUserResponse(user) : null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserCredentialsRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });
  }
}
