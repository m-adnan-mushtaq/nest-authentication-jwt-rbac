import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Length,
  Matches,
} from 'class-validator';

export class EmailDto {
  @ApiProperty({
    example: 'example@email.com',
    type: 'string',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PasswordDto {
  @ApiProperty({
    example: 'Password@12',
    type: 'string',
  })
  @IsString()
  @MinLength(6, { message: 'password should be at least 6 characters long' })
  @MaxLength(50, {
    message: 'password should not be longer than 50 characters',
  })
  password: string;
}

export class CredentialsDto extends EmailDto {
  @ApiProperty({
    example: 'Password@12',
    type: 'string',
  })
  @IsString()
  @MinLength(6, { message: 'password should be at least 6 characters long' })
  @MaxLength(50, {
    message: 'password should not be longer than 50 characters',
  })
  password: string;
}

export class LoginDto extends CredentialsDto {}

export class RegistrationDto extends CredentialsDto {
  @ApiProperty({
    example: 'John Doe',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;
}

export class ForgotPasswordDto extends EmailDto {}

export class VerifyOtpDto extends EmailDto {
  @ApiProperty({
    type: 'string',
    example: '1234',
    description: '4-digit OTP code',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

export class ResetPasswordDto extends PasswordDto {
  @ApiProperty({
    example: 'example@email.com',
    type: 'string',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    example: '1234',
    description: '4-digit OTP code',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

export class VerifyEmailDto extends EmailDto {}

export class VerifyEmailOtpDto extends EmailDto {
  @ApiProperty({
    type: 'string',
    example: '1234',
    description: '4-digit OTP code',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 4, { message: 'OTP must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP must contain only digits' })
  otp: string;
}
