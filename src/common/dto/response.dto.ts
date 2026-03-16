import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data?: T;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ required: false })
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
