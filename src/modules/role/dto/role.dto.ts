import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Unique name of the role' })
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({ description: 'Display title for the role' })
  @IsString()
  @IsOptional()
  readonly title?: string;

  @ApiPropertyOptional({ description: 'Description of the role' })
  @IsString()
  @IsOptional()
  readonly description?: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
