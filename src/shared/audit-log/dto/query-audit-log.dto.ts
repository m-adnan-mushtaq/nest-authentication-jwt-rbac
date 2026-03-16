import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { AuditEntity, AuditAction } from '../../../common/constants/enums';

export class QueryAuditLogDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by entity model',
    enum: AuditEntity,
  })
  @IsOptional()
  @IsEnum(AuditEntity)
  entityModel?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action',
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
