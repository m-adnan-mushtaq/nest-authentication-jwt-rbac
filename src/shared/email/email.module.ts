import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST,
          port:
            configService.get<number>('SMTP_PORT') ||
            Number(process.env.SMTP_PORT),
          secure: false, // true for 465, false for other ports
          auth: {
            user:
              configService.get<string>('SMTP_USERNAME') ||
              process.env.SMTP_USERNAME,
            pass:
              configService.get<string>('SMTP_PASSWORD') ||
              process.env.SMTP_PASSWORD,
          },
        },
        defaults: {
          from: configService.get<string>('SMTP_FROM') || 'noreply@evantas.com',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
