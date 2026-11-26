import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ContractsService } from './contracts.service';
import {
  ContractResponseDto,
  PaginatedContractsResponseDto,
} from './dto/contract-response.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar contratos e vagas de tripulação com paginação, filtros e busca full-text no PostgreSQL',
  })
  @ApiOkResponse({
    description: 'Lista paginada de contratos.',
    type: PaginatedContractsResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos.' })
  findAll(
    @Query() query: QueryContractsDto,
  ): Promise<PaginatedContractsResponseDto> {
    return this.contractsService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Publicar novo contrato de caçada ou recrutamento de tripulação',
  })
  @ApiCreatedResponse({
    description: 'Contrato criado com sucesso (status inicial OPEN).',
    type: ContractResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.create(createContractDto, user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar o status do próprio contrato' })
  @ApiOkResponse({
    description: 'Status do contrato atualizado com sucesso.',
    type: ContractResponseDto,
  })
  @ApiBadRequestResponse({ description: 'UUID ou status inválido.' })
  @ApiUnauthorizedResponse({ description: 'Autenticação necessária.' })
  @ApiForbiddenResponse({
    description: 'Apenas o autor do contrato pode atualizar seu status.',
  })
  @ApiNotFoundResponse({ description: 'Contrato não encontrado.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateContractStatusDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.updateStatus(id, updateDto, user.id);
  }
}
