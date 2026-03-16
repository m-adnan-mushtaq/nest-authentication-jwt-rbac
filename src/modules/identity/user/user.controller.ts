import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { User } from '@/entities/user.entity';
import { InsertUserDto } from './dto/user.dto';

/**
 * User Controller
 * Handles basic user CRUD operations
 *
 * Note: Complex user management operations (invite, status update, remove from tenant)
 * are handled by IdentityController which uses IdentityService facade
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth('users:read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@CurrentUser() user: User) {
    return this.userService.findAllUsers(user);
  }

  @Post()
  @Auth('users:create')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(
    @Body() insertUserDto: InsertUserDto,
    @CurrentUser() admin: User,
  ) {
    return this.userService.insertNewUserByAdmin(insertUserDto, admin);
  }
}
