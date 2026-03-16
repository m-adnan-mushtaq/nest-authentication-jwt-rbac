import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AbstractRepository } from '@/common/repositories/abstract.repository';
import { Helper } from '@/utils';

@Injectable()
export class ProductService extends AbstractRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository, Product.name);
  }

  async createProduct(
    dto: CreateProductDto,
    createdBy: User,
  ): Promise<Product> {
    const product = this.productRepository.create({
      title: dto.title,
      description: dto.description,
      price: String(dto.price),
      discount: dto.discount != null ? String(dto.discount) : undefined,
      createdBy,
    });
    return this.productRepository.save(product);
  }

  async findAll(
    queryDto: QueryProductDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
    } = queryDto;

    const skip = (page - 1) * limit;
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.createdBy', 'createdBy');

    if (search) {
      const escaped = Helper.escapeLikeSearch(search);
      if (escaped) {
        qb.andWhere(
          '(product.title ILIKE :search OR product.description ILIKE :search)',
          { search: `%${escaped}%` },
        );
      }
    }

    qb.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOneProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOneProduct(id);
    if (dto.title != null) product.title = dto.title;
    if (dto.description != null) product.description = dto.description;
    if (dto.price != null) product.price = String(dto.price);
    if (dto.discount != null) product.discount = String(dto.discount);
    return this.productRepository.save(product);
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.findOneProduct(id);
    await this.productRepository.softRemove(product);
  }
}
