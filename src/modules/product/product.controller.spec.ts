import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { mockProductService, mockProduct, mockUser } from '@/test/mocks';

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginated = {
        data: [mockProduct],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockProductService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductService.findOneProduct.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProduct.id);
      expect(result).toEqual(mockProduct);
      expect(mockProductService.findOneProduct).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('create', () => {
    it('should create product', async () => {
      const dto = {
        title: 'New Product',
        description: 'Desc',
        price: 49.99,
        discount: 5,
      };
      mockProductService.createProduct.mockResolvedValue({ id: 'new-id', ...dto });

      const result = await controller.create(dto as any, mockUser as any);
      expect(result.title).toBe(dto.title);
      expect(mockProductService.createProduct).toHaveBeenCalledWith(dto, mockUser);
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const dto = { title: 'Updated Title' };
      mockProductService.update.mockResolvedValue({ ...mockProduct, ...dto });

      const result = await controller.update(mockProduct.id, dto as any);
      expect(result.title).toBe(dto.title);
      expect(mockProductService.update).toHaveBeenCalledWith(
        mockProduct.id,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete product', async () => {
      mockProductService.removeProduct.mockResolvedValue(undefined);

      const result = await controller.remove(mockProduct.id);
      expect(result.message).toBe('Product deleted successfully');
      expect(mockProductService.removeProduct).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});
