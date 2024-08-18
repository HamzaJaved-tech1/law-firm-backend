// user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsDefined, IsOptional } from 'class-validator';
import { RefreshToken } from 'src/interfaces/refresh-token.interface';

export enum UserRole {
  Admin = 'admin',
  SuperAdmin = 'superadmin',
  Customer = 'customer',
  Business = 'business'
}

export class CreateUserDto {
  @IsDefined()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  dob: string;


}

export class UserResponseDto {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  isVerified: boolean;


}

export class SignInRequestDto {

  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;

}

export class SignInResponseDto {
  accessToken: string;
  refreshToken: RefreshToken;
}