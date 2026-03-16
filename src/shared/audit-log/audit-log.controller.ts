import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLog } from '../../entities/audit-log.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Auth('auditLogs:read')
  @ApiOperation({ summary: 'Get all audit logs with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async findAll(
    @Query() queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return this.auditLogService.findAllLogs(queryDto);
  }

  @Get(':id')
  @Auth('auditLogs:read')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLog> {
    return this.auditLogService.findLogById(id);
  }

  @Get('entity/:entityModel/:entityId')
  @Auth('auditLogs:read')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiParam({ name: 'entityModel', description: 'Entity model name' })
  @ApiParam({ name: 'entityId', description: 'Entity ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async findByEntity(
    @Param('entityModel') entityModel: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByEntity(entityModel, entityId);
  }

  @Get('user/:userId')
  @Auth('auditLogs:read')
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiParam({ name: 'userId', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return this.auditLogService.findByUser(userId, queryDto);
  }
}
