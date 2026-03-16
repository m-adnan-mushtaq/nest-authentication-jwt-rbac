import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { QUEUES } from '@/common/constants/common';

export interface EmailJobData {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
}

@Processor(QUEUES.EMAIL)
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, context, html, text } = job.data;

    this.logger.log(`Processing email job ${job.id} to ${to}`);

    try {
      let emailHtml = html;

      // If template is provided, compile it
      if (template && context) {
        emailHtml = await this.compileTemplate(template, context);
      }

      // Send email
      await this.mailerService.sendMail({
        to,
        subject,
        html: emailHtml,
        text: text || this.stripHtml(emailHtml || ''),
      });

      this.logger.log(`✅ Email sent successfully to ${to} (Job ${job.id})`);

      // You can update database here if needed using this.dataSource
      // Example: Log email sent status
      // await this.logEmailSent(job.id, to, subject);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${to} (Job ${job.id}):`,
        error,
      );
      throw error; // Re-throw to mark job as failed
    }
  }

  /**
   * Compile EJS template to HTML
   */
  private async compileTemplate(
    templateName: string,
    context: any,
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'email',
      `${templateName}.ejs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found at ${templatePath}`);
    }

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      return ejs.render(template, context);
    } catch (error) {
      this.logger.error(`Error compiling template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error);
  }
}
