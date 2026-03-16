import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import Model from './base.entity';

@Entity('roles')
export class Role extends Model {
  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
