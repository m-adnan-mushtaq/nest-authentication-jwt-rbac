import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import { User } from '@/entities/user.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth('products:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    return this.productService.createProduct(dto, user);
  }

  @Get()
  @Auth('products:read')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List products with pagination and search',
    description:
      'Query params: page, limit, sortBy, sortOrder, search. Search is trimmed and escaped for safety. Admin: full access. User: read-only.',
  })
  @ApiResponse({ status: 200, description: 'Paginated products' })
  async findAll(@Query() query: QueryProductDto) {
    if (query.search && typeof query.search === 'string') {
      query.search = query.search.trim();
    }
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Auth('products:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOneProduct(id);
  }

  @Patch(':id')
  @Auth('products:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Auth('products:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.removeProduct(id);
    return { message: 'Product deleted successfully' };
  }
}
