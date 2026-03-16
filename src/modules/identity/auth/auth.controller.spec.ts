import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '@/shared/token/token.service';
import { EmailService } from '@/shared/email/email.service';
import { OtpService } from '@/shared/otp/otp.service';
import { mockUserService, mockTokenService } from '@/test/mocks';

const mockEmailService = { sendResetPasswordOtp: jest.fn(), sendVerificationOtp: jest.fn() };
const mockOtpService = { generateOtp: jest.fn(), verifyOtp: jest.fn(), getOtpStatus: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
