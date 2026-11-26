import { ApiProperty } from '@nestjs/swagger';
import {
  AuthorSummaryDto,
  toAuthorSummary,
  type AuthorPublicRecord,
} from '../../common/dto/author-summary.dto';

export interface CommentRecord {
  id: string;
  content: string;
  chronicleId: string;
  createdAt: Date;
  author: AuthorPublicRecord;
}

export class CommentResponseDto {
  @ApiProperty({
    example: '33333333-3333-4333-8333-333333333301',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'Excelente descoberta arqueológica, Robin!' })
  content: string;

  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222201',
    format: 'uuid',
  })
  chronicleId: string;

  @ApiProperty({ example: '2026-11-20T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;
}

export function toCommentResponse(comment: CommentRecord): CommentResponseDto {
  return {
    id: comment.id,
    content: comment.content,
    chronicleId: comment.chronicleId,
    createdAt: comment.createdAt,
    author: toAuthorSummary(comment.author),
  };
}
