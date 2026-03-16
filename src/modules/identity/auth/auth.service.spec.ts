import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '@/shared/token/token.service';
import { EmailService } from '@/shared/email/email.service';
import { OtpService } from '@/shared/otp/otp.service';
import { mockUserService, mockTokenService, mockOtpService, mockUser } from '@/test/mocks';
import { Helper } from '@/utils';

jest.mock('@/utils', () => ({
  Helper: {
    comparePassword: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockEmailService = {
    sendResetPasswordOtp: jest.fn().mockResolvedValue(undefined),
    sendVerificationOtp: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and tokens on valid credentials', async () => {
      const userWithRole = { ...mockUser, role: { name: 'admin' } };
      mockUserService.getByUserByEmail.mockResolvedValue(userWithRole);
      (Helper.comparePassword as jest.Mock).mockReturnValue(true);
      mockUserService.updateUserByIdRaw.mockResolvedValue(undefined);
      mockTokenService.generateAccessTokens.mockResolvedValue({
        access: { token: 'jwt-token', expires: new Date() },
      });

      const result = await service.login({
        email: 'admin@example.com',
        password: 'Password@123',
      });

      expect(result.message).toBe('Login successful');
      expect(result.data.user).toBeDefined();
      expect(result.data.role).toBe('admin');
      expect(result.data.access).toBeDefined();
      expect(mockUserService.getByUserByEmail).toHaveBeenCalledWith(
        'admin@example.com',
        true,
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      mockUserService.getByUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password invalid', async () => {
      mockUserService.getByUserByEmail.mockResolvedValue(mockUser);
      (Helper.comparePassword as jest.Mock).mockReturnValue(false);

      await expect(
        service.login({
          email: 'admin@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
