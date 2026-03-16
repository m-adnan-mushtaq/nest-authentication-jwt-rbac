/**
 * Shared mocks for unit tests
 */

export const mockUserService = {
  getByUserByEmail: jest.fn(),
  updateUserByIdRaw: jest.fn(),
  findAllUsers: jest.fn(),
  insertNewUserByAdmin: jest.fn(),
};

export const mockTokenService = {
  generateAccessTokens: jest.fn().mockResolvedValue({
    access: { token: 'fake-jwt', expires: new Date() },
  }),
};

export const mockEmailService = {
  sendResetPasswordOtp: jest.fn().mockResolvedValue(undefined),
  sendVerificationOtp: jest.fn().mockResolvedValue(undefined),
};

export const mockOtpService = {
  generateOtp: jest.fn().mockResolvedValue({ otp: '1234', expiresAt: new Date() }),
  verifyOtp: jest.fn().mockResolvedValue(undefined),
  getOtpStatus: jest.fn().mockResolvedValue({ exists: false }),
};

export const mockUser = {
  id: 'user-uuid-1',
  email: 'admin@example.com',
  name: 'Admin',
  password: 'hashed',
  isEmailVerified: true,
  isActive: true,
  roleId: 'role-uuid-1',
  role: { id: 'role-uuid-1', name: 'admin' },
  activeRole: 'admin',
};

export const mockProductService = {
  createProduct: jest.fn(),
  findAll: jest.fn(),
  findOneProduct: jest.fn(),
  update: jest.fn(),
  removeProduct: jest.fn(),
};

export const mockProduct = {
  id: 'product-uuid-1',
  title: 'Test Product',
  description: 'Description',
  price: '99.99',
  discount: '10',
  createdBy: mockUser,
};
