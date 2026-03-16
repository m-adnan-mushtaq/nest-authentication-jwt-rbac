import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { AccountService } from './account/account.service';
import { User } from '../../entities/user.entity';
import { SystemRole } from '../../common/constants/enums';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(
    userId: string,
    isActive: boolean,
    actor: User,
  ): Promise<{ message: string }> {
    if (actor.activeRole !== SystemRole.ADMIN) {
      throw new ForbiddenException('Only admin can update user status');
    }
    await this.userService.updateUserById(userId, { isActive });
    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  /**
   * Delete user (admin only, soft delete)
   */
  async deleteUser(
    userId: string,
    actor: User,
  ): Promise<{ message: string }> {
    if (actor.activeRole !== SystemRole.ADMIN) {
      throw new ForbiddenException('Only admin can delete users');
    }
    await this.userService.softDeleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  /**
   * Update user profile (name, email)
   */
  async updateUserProfile(
    userId: string,
    updateDto: { name?: string; email?: string },
  ): Promise<User> {
    return this.userService.updateUserById(userId, updateDto);
  }

  /**
   * Update account details (dob, phone, address, notification preferences)
   */
  async updateAccountDetails(
    userId: string,
    accountDto: {
      dateOfBirth?: Date;
      phoneNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
      notificationChannels?: {
        whatsapp?: boolean;
        email?: boolean;
        sms?: boolean;
      };
      alertPreferences?: {
        taskAlerts?: boolean;
        eventAlerts?: boolean;
        systemAlerts?: boolean;
      };
      pauseNotifications?: boolean;
      pauseDuration?: Date;
    },
  ): Promise<void> {
    await this.accountService.updateAccountDetails(userId, accountDto);
  }
}
