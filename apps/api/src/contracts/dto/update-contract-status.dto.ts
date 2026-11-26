import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ContractStatus } from '../enums/contract-status.enum';

export class UpdateContractStatusDto {
  @ApiProperty({
    enum: ContractStatus,
    example: ContractStatus.IN_PROGRESS,
    description: 'Novo status do contrato',
  })
  @IsEnum(ContractStatus)
  status: ContractStatus;
}
