import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Account } from '../../../entities/account.entity';
import { AbstractRepository } from '../../../common/repositories/abstract.repository';
import { UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountService extends AbstractRepository<Account> {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {
    super(accountRepo, Account.name);
  }

  /**
   * Create account for a user
   * @param userId - User ID
   * @param manager - Optional transaction manager
   * @returns Created account
   */
  async createAccountForUser(
    userId: string,
    manager?: EntityManager,
  ): Promise<Account> {
    return this.create({ userId } as any, manager);
  }

  /**
   * Get account by user ID
   * @param userId - User ID
   * @param manager - Optional transaction manager
   * @returns Account or null
   */
  async getAccountByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<Account | null> {
    return this.findOne({ where: { userId } }, manager);
  }

  /**
   * Update account details
   * @param userId - User ID
   * @param updateDto - Account update data
   * @param manager - Optional transaction manager
   * @returns Updated account
   */
  async updateAccountDetails(
    userId: string,
    updateDto: UpdateAccountDto,
    manager?: EntityManager,
  ): Promise<Account> {
    const account = await this.getAccountByUserId(userId, manager);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.updateOne(account.id, updateDto as any, manager);
  }

  /**
   * Pause notifications for a duration
   * @param userId - User ID
   * @param pauseUntil - Date to resume notifications
   * @param manager - Optional transaction manager
   * @returns Updated account
   */
  async pauseNotifications(
    userId: string,
    pauseUntil: Date,
    manager?: EntityManager,
  ): Promise<Account> {
    return this.updateAccountDetails(
      userId,
      {
        pauseNotifications: true,
        pauseDuration: pauseUntil,
      },
      manager,
    );
  }

  /**
   * Resume notifications
   * @param userId - User ID
   * @param manager - Optional transaction manager
   * @returns Updated account
   */
  async resumeNotifications(
    userId: string,
    manager?: EntityManager,
  ): Promise<Account> {
    return this.updateAccountDetails(
      userId,
      {
        pauseNotifications: false,
        pauseDuration: null,
      },
      manager,
    );
  }
}
