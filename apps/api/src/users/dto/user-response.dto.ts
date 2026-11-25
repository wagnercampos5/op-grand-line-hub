import { ApiProperty } from '@nestjs/swagger';
import { Affiliation } from '../enums/affiliation.enum';

export interface UserPublicRecord {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  bounty: bigint;
  createdAt: Date;
}

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Roronoa Zoro' })
  name: string;

  @ApiProperty({ example: 'zoro@grandline.hub' })
  email: string;

  @ApiProperty({ enum: Affiliation, example: Affiliation.PIRATE })
  affiliation: Affiliation;

  @ApiProperty({
    example: 0,
    description: 'Recompensa atual em Berries (armazenada como BigInt no banco)',
  })
  bounty: number;

  @ApiProperty({ example: '2026-11-25T08:00:00.000Z' })
  createdAt: Date;
}

export function toUserResponse(user: UserPublicRecord): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    affiliation: user.affiliation as Affiliation,
    bounty: Number(user.bounty),
    createdAt: user.createdAt,
  };
}
