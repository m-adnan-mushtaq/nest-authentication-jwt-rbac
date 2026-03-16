import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyEmailOtpDto,
} from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { Helper as helper } from '@/utils';
import { TokenService } from '@/shared/token/token.service';
import { EmailService } from '@/shared/email/email.service';
import { OtpService } from '@/shared/otp/otp.service';
import { OtpType, SystemRole } from '../../../common/constants/enums';
import { getPermissionsForRole } from '../../../common/constants/permissions.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async login(body: LoginDto) {
    const user = await this.usersService.getByUserByEmail(body.email, true);

    if (!user) throw new BadRequestException('Invalid email/password');

    const { password, ...rest } = user;

    const verifyPassword = await helper.comparePassword(
      body.password,
      password,
    );

    if (!verifyPassword)
      throw new BadRequestException('Invalid email/password');

    user.activeRole = user.role?.name ?? null;

    const access_token = await this.tokenService.generateAccessTokens(user);

    const permissions = user.activeRole
      ? getPermissionsForRole(user.activeRole as SystemRole)
      : {};

    await this.usersService.updateUserByIdRaw(user.id, {
      lastLogin: new Date(),
    });

    return {
      data: {
        user: rest,
        role: user.activeRole,
        permissions,
        ...access_token,
      },
      message: 'Login successful',
    };
  }

  /**
   * Send forgot password OTP
   */
  async forgotPassword(body: ForgotPasswordDto) {
    const user = await this.usersService.getByUserByEmail(body.email);
    if (!user) {
      return {
        message: `If an account exists for ${body.email}, you will receive an OTP shortly`,
      };
    }

    const { otp, expiresAt } = await this.otpService.generateOtp(
      body.email,
      OtpType.RESET_PASSWORD,
      user.id,
    );

    await this.emailService.sendResetPasswordOtp(body.email, otp);

    return {
      message: `OTP sent to ${body.email}`,
      expiresAt,
    };
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(body: ResetPasswordDto) {
    await this.otpService.verifyOtp(
      body.email,
      body.otp,
      OtpType.RESET_PASSWORD,
    );

    const user = await this.usersService.getByUserByEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await helper.hashPassword(body.password);
    await this.usersService.updateUserById(user.id, {
      password: hashedPassword,
      isActive: true,
    });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Send email verification OTP
   */
  async sendVerificationEmail(body: VerifyEmailDto) {
    const user = await this.usersService.getByUserByEmail(body.email);
    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
    }

    if (user.isEmailVerified) {
      return {
        message: 'Email is already verified',
      };
    }

    const { otp, expiresAt } = await this.otpService.generateOtp(
      body.email,
      OtpType.VERIFY_EMAIL,
      user.id,
    );

    await this.emailService.sendVerificationOtp(body.email, otp);

    return {
      message: `Verification OTP sent to ${body.email}`,
      expiresAt,
    };
  }

  /**
   * Verify email using OTP
   */
  async verifyEmail(body: VerifyEmailOtpDto) {
    await this.otpService.verifyOtp(body.email, body.otp, OtpType.VERIFY_EMAIL);

    const user = await this.usersService.getByUserByEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.usersService.updateUserById(user.id, {
      isEmailVerified: true,
    });

    return {
      message: 'Email verified successfully',
    };
  }

  /**
   * Get OTP status for an email
   */
  async getOtpStatus(email: string, type: 'reset_password' | 'verify_email') {
    const otpType =
      type === 'reset_password' ? OtpType.RESET_PASSWORD : OtpType.VERIFY_EMAIL;
    return this.otpService.getOtpStatus(email, otpType);
  }
}
