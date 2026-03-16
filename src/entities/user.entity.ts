import { Helper } from '../utils';
import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import Model from './base.entity';
import { Token } from './token.entity';
import { Account } from './account.entity';
import { Role } from './role.entity';

@Entity('users')
export class User extends Model {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true,
  })
  lastLogin: Date;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @ManyToOne(() => Role, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

  @ManyToOne(() => User, (user) => user.createdUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  createdBy: User;

  @OneToMany(() => User, (user) => user.createdBy)
  createdUsers: User[];

  // Virtual property - not stored in DB, set at runtime
  activeRole?: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await Helper.hashPassword(this.password);
    }
  }
}
