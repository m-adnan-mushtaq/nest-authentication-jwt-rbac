import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['entityModel', 'entityId'])
@Index(['performedBy'])
export class AuditLog extends Model {
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  @Index()
  entityId?: string;

  @Column({
    name: 'entity_model',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  entityModel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action: string;

  @Column({ name: 'additional_info', type: 'jsonb', nullable: true })
  additionalInfo?: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performed_by' })
  performedBy?: User;
}
