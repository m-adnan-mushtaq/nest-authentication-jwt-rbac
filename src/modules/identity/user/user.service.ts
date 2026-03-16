import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { Not, Repository } from 'typeorm';
import { RegistrationDto } from '../auth/dto/auth.dto';
import { Helper } from '@/utils';
import { DEFAULT_PASSWORD } from '@/common/constants/common';
import { TokenService } from '@/shared/token/token.service';
import { EmailService } from '@/shared/email/email.service';
import { InsertUserDto } from './dto/user.dto';
import { AbstractRepository } from '@/common/repositories/abstract.repository';
import { RoleService } from '../../role/role.service';

@Injectable()
export class UserService extends AbstractRepository<User> {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private tokenService: TokenService,
    private emailService: EmailService,
    private roleService: RoleService,
  ) {
    super(userRepo, User.name);
  }

  async register(body: RegistrationDto) {
    const { email } = body;
    const user = await this.findOne({
      where: { email },
    });

    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const newUser = await this.userRepo.save(this.userRepo.create(body));

    const finalResp = Object.defineProperty(newUser, 'password', {
      enumerable: false,
    });

    return {
      success: true,
      message: 'User registered successfully',
      data: finalResp,
    };
  }

  async findAllUsers(loggedInUser: User): Promise<unknown> {
    const users = await this.findAndCount({
      select: ['id', 'name', 'email'],
      where: {
        id: Not(loggedInUser.id),
      },
      relations: ['role'],
      skip: 0,
      take: 10,
    });

    return Helper.paginateResponse({ data: users, page: 1, limit: 10 });
  }

  async getByUserByEmail(email: string, shouldPopulate = false) {
    const user = await this.findOne({
      where: { email },
      ...(shouldPopulate ? { relations: ['role'] } : {}),
    });
    return user;
  }

  async softDeleteUser(userId: string) {
    await this.remove(userId);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async updateUserById(id: string, body: Partial<User>) {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(user, body);
    return await this.userRepo.save(user);
  }

  async updateUserByIdRaw(id: string, body: Partial<User>) {
    return await this.updateByIdRaw(id, body);
  }

  /**
   * Create a new user with hashed password
   */
  async createUserWithPassword(
    data: {
      email: string;
      name: string;
      password: string;
      isActive?: boolean;
      isEmailVerified?: boolean;
    },
    manager?: import('typeorm').EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepo;

    const hashedPassword = await Helper.hashPassword(data.password);
    const user = repo.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      isActive: data.isActive ?? true,
      isEmailVerified: data.isEmailVerified ?? false,
    });

    return repo.save(user);
  }

  /**
   * Insert new user by admin (assigns role)
   */
  async insertNewUserByAdmin(body: InsertUserDto, admin: User) {
    const foundRole = await this.roleService.findRoleById(body.role);
    if (!foundRole) {
      throw new BadRequestException('Role not found');
    }

    const existingUser = await this.getByUserByEmail(body.email, false);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await Helper.hashPassword(DEFAULT_PASSWORD);
    const newUser = this.userRepo.create({
      email: body.email,
      name: body.name,
      password: hashedPassword,
      createdBy: admin,
      roleId: foundRole.id,
      isActive: false,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepo.save(newUser);

    const resetPasswordToken =
      await this.tokenService.generateResetPasswordToken(savedUser.id);
    await this.emailService.sendResetPasswordOtp(
      savedUser.email,
      resetPasswordToken,
    );

    return {
      message: `Welcome email sent to ${savedUser.email}`,
      user: savedUser,
    };
  }
}
