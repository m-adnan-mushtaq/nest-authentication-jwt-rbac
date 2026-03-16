import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

@Entity('products')
export class Product extends Model {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, nullable: true })
  discount: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
