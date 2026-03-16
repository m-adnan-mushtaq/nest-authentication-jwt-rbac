import {
  Repository,
  FindOneOptions,
  FindManyOptions,
  EntityManager,
  DeepPartial,
  UpdateResult,
  DataSource,
} from 'typeorm';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import Model from '../../entities/base.entity';
import { AuditLog } from '../../entities/audit-log.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  HARD_DELETE = 'hard_delete',
  RESTORE = 'restore',
}

export interface AuditContext {
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export abstract class AbstractRepository<T extends Model> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    private readonly entityName: string,
  ) {
    this.logger = new Logger(`${entityName}Repository`);
  }

  /**
   * Get the DataSource from the repository for audit logging
   */
  protected getDataSource(): DataSource {
    return this.repository.manager.connection;
  }

  /**
   * Create a new entity
   * @param payload - Partial entity data
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Created entity
   */
  async create(
    payload: DeepPartial<T>,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    const entity = repo.create(payload);
    const savedEntity = await repo.save(entity);

    if (auditContext) {
      await this.logAudit(
        AuditAction.CREATE,
        savedEntity,
        payload,
        manager,
        auditContext,
      );
    }

    return savedEntity;
  }

  /**
   * Create multiple entities in bulk
   * @param payloads - Array of partial entity data
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Array of created entities
   */
  async createMany(
    payloads: DeepPartial<T>[],
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<T[]> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const entities = repo.create(payloads as any[]);
    const savedEntities = await repo.save(entities);

    if (auditContext) {
      // Log audit for batch create
      await this.logAudit(
        AuditAction.CREATE,
        savedEntities[0], // Use first entity as reference
        { count: savedEntities.length, items: payloads },
        manager,
        auditContext,
      );
    }

    this.logger.log(
      `Created ${savedEntities.length} ${this.entityName} entities`,
    );
    return savedEntities;
  }

  async updateByIdRaw(
    id: string,
    payload: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return await repo
      .createQueryBuilder()
      .update()
      .set(payload as any)
      .where('id = :id', { id })
      .returning('*')
      .execute();
  }

  /**
   * Update multiple entities matching criteria
   * @param criteria - Where conditions
   * @param payload - Update data
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Update result
   */
  async updateMany(
    criteria: any,
    payload: DeepPartial<T>,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<UpdateResult> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const result = await repo.update(criteria, payload as any);

    if (auditContext && result.affected && result.affected > 0) {
      await this.logAudit(
        AuditAction.UPDATE,
        { id: 'bulk' } as T,
        { criteria, payload, affected: result.affected },
        manager,
        auditContext,
      );
    }

    this.logger.log(
      `Updated ${result.affected || 0} ${this.entityName} entities`,
    );
    return result;
  }

  /**
   * Find one entity
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Entity or null
   */
  async findOne(
    options: FindOneOptions<T>,
    manager?: EntityManager,
  ): Promise<T | null> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return repo.findOne(options);
  }

  /**
   * Find one entity or throw NotFoundException
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Entity
   * @throws NotFoundException if entity not found
   */
  async findOneOrFail(
    options: FindOneOptions<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const entity = await this.findOne(options, manager);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return entity;
  }

  /**
   * Find multiple entities
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Array of entities
   */
  async find(
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<T[]> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return repo.find(options);
  }

  /**
   * Find entities with pagination
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Entities and count
   */
  async findAndCount(
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<[T[], number]> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return repo.findAndCount(options);
  }

  /**
   * Update one entity
   * @param id - Entity ID
   * @param payload - Update data
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Updated entity
   */
  async updateOne(
    id: string,
    payload: DeepPartial<T>,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const entity = await repo.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    const previousState = { ...entity };
    const updatedEntity = await repo.save({ ...entity, ...payload });

    if (auditContext) {
      await this.logAudit(
        AuditAction.UPDATE,
        updatedEntity,
        { previous: previousState, changes: payload },
        manager,
        auditContext,
      );
    }

    return updatedEntity;
  }

  /**
   * Soft delete an entity
   * @param id - Entity ID
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Deleted entity
   */
  async remove(
    id: string,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const entity = await repo.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    const deletedEntity = await repo.softRemove(entity);

    if (auditContext) {
      await this.logAudit(
        AuditAction.DELETE,
        deletedEntity,
        { entityId: id },
        manager,
        auditContext,
      );
    }

    return deletedEntity;
  }

  /**
   * Restore a soft-deleted entity
   * @param id - Entity ID
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   * @returns Restored entity
   */
  async restore(
    id: string,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const entity = await repo.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    const restoredEntity = await repo.recover(entity);

    if (auditContext) {
      await this.logAudit(
        AuditAction.RESTORE,
        restoredEntity,
        { entityId: id },
        manager,
        auditContext,
      );
    }

    this.logger.log(`Restored ${this.entityName} with ID: ${id}`);
    return restoredEntity;
  }

  /**
   * Hard delete an entity
   * @param id - Entity ID
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Optional audit context for logging
   */
  async hardRemove(
    id: string,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;

    const entity = await repo.findOne({ where: { id } as any });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    if (auditContext) {
      await this.logAudit(
        AuditAction.HARD_DELETE,
        entity,
        { entityId: id },
        manager,
        auditContext,
      );
    }

    await repo.remove(entity);
    this.logger.warn(`Hard deleted ${this.entityName} with ID: ${id}`);
  }

  /**
   * Count entities
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Count
   */
  async count(
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return repo.count(options);
  }

  /**
   * Check if entity exists
   * @param options - Find options
   * @param manager - Optional entity manager for transactions
   * @returns Boolean
   */
  async exists(
    options: FindOneOptions<T>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(options as FindManyOptions<T>, manager);
    return count > 0;
  }

  /**
   * Log audit entry for entity operations
   * @param action - Action performed (create, update, delete)
   * @param entity - Entity affected
   * @param payload - Data used in the action
   * @param manager - Optional entity manager for transactions
   * @param auditContext - Audit context with user/tenant info
   */
  protected async logAudit(
    action: AuditAction,
    entity: T,
    payload: any,
    manager?: EntityManager,
    auditContext?: AuditContext,
  ): Promise<void> {
    try {
      const dataSource = this.getDataSource();
      const auditRepo = manager
        ? manager.getRepository(AuditLog)
        : dataSource.getRepository(AuditLog);

      const auditLog = auditRepo.create({
        entityId: entity.id,
        entityModel: this.entityName,
        action: action,
        additionalInfo: this.sanitizePayload(payload),
        performedBy: auditContext?.userId
          ? ({ id: auditContext.userId } as any)
          : undefined,
        ipAddress: auditContext?.ipAddress,
        userAgent: auditContext?.userAgent,
      });

      await auditRepo.save(auditLog);
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Sanitize payload to remove sensitive data before logging
   * Override this method in child classes for custom sanitization
   */
  protected sanitizePayload(payload: any): Record<string, any> {
    if (!payload || typeof payload !== 'object') {
      return { value: payload };
    }

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    const sanitized = { ...payload };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
