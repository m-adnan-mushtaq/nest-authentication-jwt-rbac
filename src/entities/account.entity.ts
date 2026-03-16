import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import Model from './base.entity';
import { User } from './user.entity';

export interface NotificationChannels {
  whatsapp: boolean;
  email: boolean;
  sms: boolean;
}

export interface AlertPreferences {
  taskAlerts: boolean;
  eventAlerts: boolean;
  systemAlerts: boolean;
  tenantUpdates: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

@Entity('accounts')
export class Account extends Model {
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  address: Address;

  @Column({
    name: 'notification_channels',
    type: 'jsonb',
    default: { whatsapp: true, email: true, sms: false },
  })
  notificationChannels: NotificationChannels;

  @Column({
    name: 'alert_preferences',
    type: 'jsonb',
    default: {
      taskAlerts: true,
      eventAlerts: true,
      systemAlerts: true,
      tenantUpdates: true,
    },
  })
  alertPreferences: AlertPreferences;

  @Column({ name: 'pause_notifications', type: 'boolean', default: false })
  pauseNotifications: boolean;

  @Column({ name: 'pause_duration', type: 'timestamp', nullable: true })
  pauseDuration: Date;

  @OneToOne(() => User, (user) => user.account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;
}
