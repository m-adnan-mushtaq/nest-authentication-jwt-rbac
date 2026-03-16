import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, EntityManager } from 'typeorm';
import { Otp } from '../../entities/otp.entity';
import { ConfigService } from '@nestjs/config';
import { OtpType } from '@/common/constants/enums';

const MAX_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a 4-digit OTP
   */
  private generateOtpCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Generate and save OTP for a user
   */
  async generateOtp(
    email: string,
    type: OtpType,
    userId?: string,
    manager?: EntityManager,
  ): Promise<{ otp: string; expiresAt: Date }> {
    const repo = manager ? manager.getRepository(Otp) : this.otpRepository;
    // Check for recent OTP to prevent spam
    const recentOtp = await repo.findOne({
      where: {
        email,
        type,
        createdAt: MoreThan(
          new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000),
        ),
      },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) {
      const secondsRemaining = Math.ceil(
        (recentOtp.createdAt.getTime() +
          OTP_RESEND_COOLDOWN_SECONDS * 1000 -
          Date.now()) /
          1000,
      );
      throw new BadRequestException(
        `Please wait ${secondsRemaining} seconds before requesting a new OTP`,
      );
    }

    // Invalidate any existing unused OTPs for this email and type
    await repo.update({ email, type, isUsed: false }, { isUsed: true });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiryMinutes =
      this.configService.get<number>('OTP_EXPIRY_MINUTES') ||
      OTP_EXPIRY_MINUTES;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const otp = repo.create({
      code,
      email,
      type,
      expiresAt,
      isUsed: false,
      attempts: 0,
      user: userId ? ({ id: userId } as any) : undefined,
    });

    await repo.save(otp);

    return { otp: code, expiresAt };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    email: string,
    code: string,
    type: OtpType,
  ): Promise<{ valid: boolean; userId?: string }> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        type,
        isUsed: false,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new NotFoundException('No OTP found for this email');
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      await this.otpRepository.update(otp.id, { isUsed: true });
      throw new BadRequestException(
        'OTP has expired. Please request a new one',
      );
    }

    // Check max attempts
    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      await this.otpRepository.update(otp.id, { isUsed: true });
      throw new BadRequestException(
        'Maximum OTP attempts exceeded. Please request a new OTP',
      );
    }

    // Verify code
    if (otp.code !== code) {
      await this.otpRepository.update(otp.id, { attempts: otp.attempts + 1 });
      const remainingAttempts = MAX_OTP_ATTEMPTS - otp.attempts - 1;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempts remaining`,
      );
    }

    // Mark as used
    await this.otpRepository.update(otp.id, { isUsed: true });

    return {
      valid: true,
      userId: otp.user?.id,
    };
  }

  /**
   * Clean up expired OTPs (can be called via cron job)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  /**
   * Get OTP status for an email
   */
  async getOtpStatus(
    email: string,
    type: OtpType,
  ): Promise<{
    hasPendingOtp: boolean;
    expiresAt?: Date;
    canResend: boolean;
    resendInSeconds?: number;
  }> {
    const otp = await this.otpRepository.findOne({
      where: {
        email,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      return { hasPendingOtp: false, canResend: true };
    }

    const timeSinceCreation = Date.now() - otp.createdAt.getTime();
    const canResend = timeSinceCreation > OTP_RESEND_COOLDOWN_SECONDS * 1000;
    const resendInSeconds = canResend
      ? 0
      : Math.ceil(
          (OTP_RESEND_COOLDOWN_SECONDS * 1000 - timeSinceCreation) / 1000,
        );

    return {
      hasPendingOtp: true,
      expiresAt: otp.expiresAt,
      canResend,
      resendInSeconds: canResend ? undefined : resendInSeconds,
    };
  }
}
