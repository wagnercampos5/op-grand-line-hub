import { ApiProperty } from '@nestjs/swagger';

export class ChronicleLikeResponseDto {
  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222201',
    format: 'uuid',
  })
  chronicleId: string;

  @ApiProperty({ example: true })
  liked: boolean;

  @ApiProperty({ example: 14 })
  likesCount: number;
}
