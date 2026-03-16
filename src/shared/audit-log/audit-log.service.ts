import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsWhere } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { User } from '../../entities/user.entity';
import { AbstractRepository } from '@/common/repositories/abstract.repository';

@Injectable()
export class AuditLogService extends AbstractRepository<AuditLog> {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {
    super(auditLogRepository, AuditLog.name);
  }

  /**
   * Create audit log entry
   */
  async createLog(
    createAuditLogDto: CreateAuditLogDto,
    performedBy?: User,
    manager?: EntityManager,
  ): Promise<AuditLog> {
    const repo = manager
      ? manager.getRepository(AuditLog)
      : this.auditLogRepository;

    const auditLog = repo.create({
      ...createAuditLogDto,
      performedBy,
    });

    return repo.save(auditLog);
  }

  /**
   * Find all audit logs with pagination and filters
   */
  async findAllLogs(
    queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AuditLog> = {};

    if (queryDto.entityModel) {
      where.entityModel = queryDto.entityModel;
    }

    if (queryDto.entityId) {
      where.entityId = queryDto.entityId;
    }

    if (queryDto.action) {
      where.action = queryDto.action;
    }

    if (queryDto.userId) {
      where.performedBy = { id: queryDto.userId };
    }

    const [data, total] = await this.findAndCount({
      where,
      relations: ['performedBy'],
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Find one audit log by ID
   */
  async findLogById(id: string): Promise<AuditLog> {
    const auditLog = await this.findOne({
      where: { id },
      relations: ['performedBy'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  /**
   * Find audit logs by entity
   */
  async findByEntity(
    entityModel: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.find({
      where: { entityModel, entityId },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find audit logs by user
   */
  async findByUser(
    userId: string,
    queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.findAndCount({
      where: { performedBy: { id: userId } },
      relations: ['performedBy'],
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
