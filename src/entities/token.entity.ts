import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity'; // Adjust the import path based on your project structure
import { TokenTypes } from '../common/enums';
import Model from './base.entity';

@Entity('tokens')
export class Token extends Model {
  @Column({ unique: true })
  token: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: TokenTypes,
  })
  type: TokenTypes;

  @Column()
  expires: Date;

  @Column({ default: false })
  blacklisted: boolean;
}
