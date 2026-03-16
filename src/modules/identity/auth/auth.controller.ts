import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyEmailOtpDto,
} from './dto/auth.dto';
import { LoggedUser } from '@/common/decorators/user.decorator';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/entities/user.entity';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({ description: 'Login successful' })
  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({
    summary: 'Send Forgot Password OTP',
    description: 'Sends a 4-digit OTP to the email for password reset',
  })
  @ApiOkResponse({ description: 'OTP sent successfully' })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @ApiOperation({
    summary: 'Reset Password with OTP',
    description: 'Reset password using 4-digit OTP received via email',
  })
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired OTP',
  })
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @ApiOperation({
    summary: 'Send Email Verification OTP',
    description: 'Sends a 4-digit OTP to verify email address',
  })
  @ApiOkResponse({ description: 'Verification OTP sent successfully' })
  @HttpCode(200)
  @Post('send-verification-otp')
  async sendVerificationEmail(@Body() body: VerifyEmailDto) {
    return this.authService.sendVerificationEmail(body);
  }

  @ApiOperation({
    summary: 'Verify Email with OTP',
    description: 'Verify email using 4-digit OTP',
  })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired OTP',
  })
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailOtpDto) {
    return this.authService.verifyEmail(body);
  }

  @ApiOperation({
    summary: 'Get OTP Status',
    description: 'Check if there is a pending OTP and when it expires',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email address',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['reset_password', 'verify_email'],
    description: 'OTP type',
  })
  @ApiOkResponse({ description: 'OTP status retrieved' })
  @HttpCode(200)
  @Get('otp-status')
  async getOtpStatus(
    @Query('email') email: string,
    @Query('type') type: 'reset_password' | 'verify_email',
  ) {
    return this.authService.getOtpStatus(email, type);
  }

  @ApiOperation({ summary: 'Get Current User Profile' })
  @ApiOkResponse({ description: 'Profile retrieved successfully' })
  @Get('me')
  @Auth()
  async getProfileRoute(@LoggedUser() user: User) {
    return user;
  }
}
