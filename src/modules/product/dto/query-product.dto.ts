import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search in title and description (trimmed and escaped for safety)',
    example: 'laptop',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
