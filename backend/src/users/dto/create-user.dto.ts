import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters long!' })
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
