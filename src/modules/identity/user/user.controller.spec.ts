import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { mockUserService, mockUser } from '@/test/mocks';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginated = {
        data: [{ id: mockUser.id, name: mockUser.name, email: mockUser.email }],
        metaInfo: { totalRecords: 1, currentPage: 1 },
      };
      mockUserService.findAllUsers.mockResolvedValue(paginated);

      const result = await controller.findAll(mockUser as any);
      expect(result).toEqual(paginated);
      expect(mockUserService.findAllUsers).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create user and return result', async () => {
      const dto = {
        email: 'new@example.com',
        name: 'New User',
        role: 'role-uuid-2',
      };
      const created = {
        message: 'Welcome email sent',
        user: { id: 'new-id', ...dto },
      };
      mockUserService.insertNewUserByAdmin.mockResolvedValue(created);

      const result = await controller.createUser(dto as any, mockUser as any);
      expect(result).toEqual(created);
      expect(mockUserService.insertNewUserByAdmin).toHaveBeenCalledWith(
        dto,
        mockUser,
      );
    });
  });
});
