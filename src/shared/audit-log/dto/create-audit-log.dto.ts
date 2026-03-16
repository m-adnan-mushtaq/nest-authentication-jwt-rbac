import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';
import { AuditEntity, AuditAction } from '../../../common/constants/enums';

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    description: 'Entity ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Entity model name',
    enum: AuditEntity,
    example: AuditEntity.USER,
  })
  @IsEnum(AuditEntity)
  entityModel: string;

  @ApiProperty({
    description: 'Action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsEnum(AuditAction)
  action: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: { field: 'value' },
  })
  @IsOptional()
  @IsObject()
  additionalInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
