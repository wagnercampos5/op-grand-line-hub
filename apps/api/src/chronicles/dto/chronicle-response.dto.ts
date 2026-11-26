import { ApiProperty } from '@nestjs/swagger';
import {
  AuthorSummaryDto,
  toAuthorSummary,
  type AuthorPublicRecord,
} from '../../common/dto/author-summary.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ChronicleCategory } from '../enums/chronicle-category.enum';
import {
  CommentResponseDto,
  toCommentResponse,
  type CommentRecord,
} from './comment-response.dto';

export interface ChronicleHydratedRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  coverUrl: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: AuthorPublicRecord;
  comments: CommentRecord[];
  _count: {
    likes: number;
    comments: number;
  };
  likes?: Array<{ userId: string }>;
}

export class ChronicleResponseDto {
  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222201',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Inscrições em Poneglyphs Submersos sob as Fundações de Water 7',
  })
  title: string;

  @ApiProperty({
    example:
      'Durante o recuo anual da Aqua Laguna, galerias submersas revelaram glifos ancestrais...',
  })
  content: string;

  @ApiProperty({
    enum: ChronicleCategory,
    example: ChronicleCategory.VOID_CENTURY,
  })
  category: ChronicleCategory;

  @ApiProperty({
    example: 'http://localhost:5173/banner-login.jpg',
    nullable: true,
    type: String,
  })
  coverUrl: string | null;

  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111101',
    format: 'uuid',
  })
  authorId: string;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;

  @ApiProperty({ example: 3 })
  likesCount: number;

  @ApiProperty({ example: 2 })
  commentsCount: number;

  @ApiProperty({
    example: false,
    description: 'Indica se o tripulante autenticado já curtiu esta crônica',
  })
  likedByMe: boolean;

  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({ example: '2026-11-20T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-20T10:30:00.000Z' })
  updatedAt: Date;
}

export class PaginatedChroniclesResponseDto {
  @ApiProperty({ type: [ChronicleResponseDto] })
  data: ChronicleResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export function toChronicleResponse(
  chronicle: ChronicleHydratedRecord,
): ChronicleResponseDto {
  return {
    id: chronicle.id,
    title: chronicle.title,
    content: chronicle.content,
    category: chronicle.category as ChronicleCategory,
    coverUrl: chronicle.coverUrl,
    authorId: chronicle.authorId,
    author: toAuthorSummary(chronicle.author),
    likesCount: chronicle._count.likes,
    commentsCount: chronicle._count.comments,
    likedByMe: Boolean(chronicle.likes && chronicle.likes.length > 0),
    comments: chronicle.comments.map(toCommentResponse),
    createdAt: chronicle.createdAt,
    updatedAt: chronicle.updatedAt,
  };
}
