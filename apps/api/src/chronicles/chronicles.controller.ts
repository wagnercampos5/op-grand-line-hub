import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalCurrentUser } from '../auth/decorators/optional-current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ChroniclesService } from './chronicles.service';
import { ChronicleLikeResponseDto } from './dto/chronicle-like-response.dto';
import {
  ChronicleResponseDto,
  PaginatedChroniclesResponseDto,
} from './dto/chronicle-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateChronicleDto } from './dto/create-chronicle.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryChroniclesDto } from './dto/query-chronicles.dto';

@ApiTags('chronicles')
@Controller('chronicles')
export class ChroniclesController {
  constructor(private readonly chroniclesService: ChroniclesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      'Listar crônicas da Grand Line com paginação e busca full-text no PostgreSQL',
  })
  @ApiOkResponse({
    description: 'Lista paginada de crônicas.',
    type: PaginatedChroniclesResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos.' })
  findAll(
    @Query() query: QueryChroniclesDto,
    @OptionalCurrentUser() user?: UserResponseDto,
  ): Promise<PaginatedChroniclesResponseDto> {
    return this.chroniclesService.findAll(query, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publicar nova crônica na Grand Line' })
  @ApiCreatedResponse({
    description: 'Crônica publicada com sucesso.',
    type: ChronicleResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  create(
    @Body() createChronicleDto: CreateChronicleDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ChronicleResponseDto> {
    return this.chroniclesService.create(createChronicleDto, user.id);
  }

  @Post(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Curtir uma crônica (idempotente)' })
  @ApiOkResponse({
    description: 'Curtida registrada com sucesso.',
    type: ChronicleLikeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'UUID inválido.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  @ApiNotFoundResponse({ description: 'Crônica não encontrada.' })
  like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ChronicleLikeResponseDto> {
    return this.chroniclesService.like(id, user.id);
  }

  @Delete(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover curtida de uma crônica (idempotente)' })
  @ApiOkResponse({
    description: 'Curtida removida com sucesso.',
    type: ChronicleLikeResponseDto,
  })
  @ApiBadRequestResponse({ description: 'UUID inválido.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  @ApiNotFoundResponse({ description: 'Crônica não encontrada.' })
  unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ChronicleLikeResponseDto> {
    return this.chroniclesService.unlike(id, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Listar comentários de uma crônica' })
  @ApiOkResponse({
    description: 'Comentários ordenados cronologicamente.',
    type: [CommentResponseDto],
  })
  @ApiBadRequestResponse({ description: 'UUID inválido.' })
  @ApiNotFoundResponse({ description: 'Crônica não encontrada.' })
  findComments(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommentResponseDto[]> {
    return this.chroniclesService.findComments(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar comentário a uma crônica' })
  @ApiCreatedResponse({
    description: 'Comentário publicado com sucesso.',
    type: CommentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou UUID malformado.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  @ApiNotFoundResponse({ description: 'Crônica não encontrada.' })
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<CommentResponseDto> {
    return this.chroniclesService.addComment(id, createCommentDto, user.id);
  }
}
