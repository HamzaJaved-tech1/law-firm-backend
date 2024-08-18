import { IsString, IsDefined } from 'class-validator';

export class VerifyOtpDto {
  @IsDefined()
  @IsString()
  otp: string;

  @IsDefined()
  @IsString()
  email: string;
}
export class ResendOtpDto {
  @IsDefined()
  @IsString()
  email: string;
}