import {
  Controller,
  Patch,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { User } from '@/entities/user.entity';
import { UpdateAccountDto } from './account/dto/account.dto';

@ApiTags('Identity Management')
@ApiBearerAuth()
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Patch('users/:id/status')
  @Auth('users:update')
  @ApiOperation({ summary: 'Update user account status' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() body: { isActive: boolean },
    @CurrentUser() actor: User,
  ) {
    return this.identityService.updateUserStatus(userId, body.isActive, actor);
  }

  @Delete('users/:id')
  @Auth('users:delete')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser() actor: User,
  ) {
    return this.identityService.deleteUser(userId, actor);
  }

  @Patch('users/:id/profile')
  @Auth('users:update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateUserProfile(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateDto: { name?: string; email?: string },
  ) {
    return this.identityService.updateUserProfile(userId, updateDto);
  }

  @Patch('users/:id/account')
  @Auth('users:update')
  @ApiOperation({
    summary: 'Update user account details (dob, phone, address, notifications)',
  })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Account details updated successfully' })
  async updateAccountDetails(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() accountDto: UpdateAccountDto,
  ) {
    await this.identityService.updateAccountDetails(userId, accountDto);
    return { message: 'Account details updated successfully' };
  }
}
