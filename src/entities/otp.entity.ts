import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import Model from './base.entity';


@Entity('otps')
@Index(['email', 'type'])
export class Otp extends Model {
  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({
    type: 'varchar',
    length: 100
  })
  type: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ name: 'attempts', type: 'int', default: 0 })
  attempts: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
