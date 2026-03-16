import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number, defaults to 1 if not provided',
    type: 'number',
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
  @ApiPropertyOptional({
    description:
      'Limit on the number of items per page, defaults to 10 if not provided',
    type: 'number',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
  @ApiPropertyOptional({
    description: 'Search query',
    type: 'string',
  })
  @IsOptional()
  @Type(() => String)
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    type: 'string',
  })
  @IsOptional()
  @Type(() => String)
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Sort order',
    type: 'string',
  })
  @IsOptional()
  @Type(() => String)
  sortOrder?: string = 'desc';
}
