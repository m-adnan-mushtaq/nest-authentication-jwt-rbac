import { EmailDto } from '@/modules/identity/auth/dto/auth.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class InsertUserDto extends EmailDto {
  @ApiProperty({
    example: 'John Doe',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
    description: 'Role ID (UUID) - admin or user',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'role id is required' })
  role: string;
}
