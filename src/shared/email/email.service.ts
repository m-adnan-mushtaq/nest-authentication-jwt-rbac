import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private useQueue: boolean;

  constructor(
    private readonly mailService: MailerService,
    private readonly config: ConfigService,
    @Optional()
    @Inject(QueueService)
    private readonly queueService?: QueueService,
  ) {
    // Use queue if QueueService is available, otherwise send directly
    this.useQueue = !!this.queueService;
    if (this.useQueue) {
      this.logger.log('📧 Email service configured to use queue system');
    } else {
      this.logger.warn(
        '⚠️ QueueService not available, emails will be sent directly',
      );
    }
  }

  /**
   * Send email directly or via queue
   * @param options Mail options
   * @returns Send result or job
   */
  async sendMail(options: ISendMailOptions) {
    // If queue is available, use it; otherwise send directly
    if (this.useQueue && this.queueService) {
      this.logger.log(
        `📬 Adding email to queue: ${options.to} - ${options.subject}`,
      );
      return this.queueService.addEmailJob({
        to: options.to as string,
        subject: options.subject || '',
        html: options.html as string,
        text: options.text as string,
      });
    }

    // Fallback to direct sending
    try {
      const result = await this.mailService.sendMail(options);
      this.logger.log(`✅ Email sent to ${options.to}: ${options.subject}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error sending email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Compile EJS template to HTML
   * @param templateName Template file name (without .ejs extension)
   * @param context Data to pass to template
   * @returns Compiled HTML string
   */
  async compileTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'email',
      `${templateName}.ejs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new BadRequestException(
        `Template ${templateName} not found at ${templatePath}`,
      );
    }

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      return ejs.render(template, context);
    } catch (error) {
      this.logger.error(`Error compiling template ${templateName}:`, error);
      throw new BadRequestException(`Error compiling template ${templateName}`);
    }
  }

  /**
   * Send email with template
   * @param options Email options with template
   */
  async sendTemplatedEmail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    // If queue is available, add job with template info
    if (this.useQueue && this.queueService) {
      this.logger.log(
        `📬 Adding templated email to queue: ${options.to} - ${options.template}`,
      );
      await this.queueService.addEmailJob({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
      return;
    }

    // Fallback to direct sending
    const html = await this.compileTemplate(options.template, options.context);
    await this.sendMail({
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  /**
   * Send OTP email for any purpose
   * @param email Recipient email
   * @param otp OTP code
   * @param purpose Purpose of OTP (for display)
   * @param expiryMinutes Expiry time in minutes
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    purpose: string = 'verification',
    expiryMinutes: number = 10,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      to: email,
      subject: `Your OTP Code - Evantas`,
      template: 'otp',
      context: {
        title: 'Your OTP Code',
        message: `Use this OTP to ${purpose}. This code is valid for ${expiryMinutes} minutes.`,
        otp,
        appName: 'Evantas',
        expiryMinutes,
      },
    });
  }

  /**
   * Send reset password OTP email
   */
  async sendResetPasswordOtp(
    email: string,
    otp: string,
    expiryMinutes: number = 10,
  ): Promise<void> {
    await this.sendOtpEmail(email, otp, 'reset your password', expiryMinutes);
  }

  /**
   * Send email verification OTP
   */
  async sendVerificationOtp(
    email: string,
    otp: string,
    expiryMinutes: number = 10,
  ): Promise<void> {
    await this.sendOtpEmail(email, otp, 'verify your email', expiryMinutes);
  }

  /**
   * Send welcome email with OTP
   */
  async sendWelcomeEmailWithOtp(
    email: string,
    otp: string,
    name?: string,
    expiryMinutes: number = 10,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      to: email,
      subject: 'Welcome to Evantas! 🎉',
      template: 'welcome',
      context: {
        title: 'Welcome to Evantas',
        name: name || 'there',
        message: `Thank you for signing up! Use the OTP below to verify your email. This code is valid for ${expiryMinutes} minutes.`,
        otp,
        appName: 'Evantas',
        expiryMinutes,
      },
    });
  }

  /**
   * Send generic email using base template
   * @param options Email options
   */
  async sendGenericEmail(options: {
    to: string;
    subject: string;
    title: string;
    message: string;
    link?: string;
    linkLabel?: string;
  }): Promise<void> {
    await this.sendTemplatedEmail({
      to: options.to,
      subject: options.subject,
      template: 'base',
      context: {
        title: options.title,
        message: options.message,
        link: options.link,
        linkLabel: options.linkLabel,
        appName: 'Evantas',
      },
    });
  }

  /**
   * Send activation email to new user
   */
  async sendAccountActivationEmail(
    email: string,
    activationToken: string,
    appName: string = 'App',
  ): Promise<void> {
    await this.sendTemplatedEmail({
      to: email,
      subject: 'Activate your account',
      template: 'account-activation',
      context: {
        title: 'Welcome! Activate Your Account',
        tenantName: appName,
        link: `${this.getFrontendUrl()}/activate?token=${activationToken}`,
        linkLabel: 'Activate Account',
        appName: 'Evantas',
      },
    });
  }

  private getFrontendUrl() {
    return this.config.get<string>('FRONTEND_URL');
  }
}
