import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from '../../entities/product.entity';
import { mockUser } from '@/test/mocks';
import { SortOrder } from '@/common/dto/pagination.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create and return product', async () => {
      const dto = {
        title: 'Product',
        description: 'Desc',
        price: 99.99,
        discount: 10,
      };
      const product = {
        id: 'prod-1',
        ...dto,
        price: '99.99',
        discount: '10',
        createdBy: mockUser,
      };
      mockRepository.create.mockReturnValue(product);
      mockRepository.save.mockResolvedValue(product);

      const result = await service.createProduct(dto as any, mockUser as any);
      expect(result).toEqual(product);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOneProduct', () => {
    it('should return product when found', async () => {
      const product = { id: 'prod-1', title: 'Test' };
      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOneProduct('prod-1');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneProduct('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      });
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('update', () => {
    it('should update and return product', async () => {
      const existing = {
        id: 'prod-1',
        title: 'Old',
        description: 'Desc',
        price: '10',
        discount: '0',
      };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({
        ...existing,
        title: 'New Title',
      });

      const result = await service.update('prod-1', {
        title: 'New Title',
      } as any);
      expect(result.title).toBe('New Title');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeProduct', () => {
    it('should soft remove product', async () => {
      const product = { id: 'prod-1', title: 'Test' };
      mockRepository.findOne.mockResolvedValue(product);
      mockRepository.softRemove.mockResolvedValue(product);

      await service.removeProduct('prod-1');
      expect(mockRepository.softRemove).toHaveBeenCalledWith(product);
    });
  });
});
