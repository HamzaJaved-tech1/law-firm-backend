import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SignInRequestDto, SignInResponseDto, UserResponseDto } from './dto/user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { UserData } from './interfaces/user-data.interface';
import { ResendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ResponseModel } from './common/responseModel';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ResponseModel<UserResponseDto>> {
    return await this.authService.signup(createUserDto);
  }

  @Public()
  @Post('signin')
  async signin(@Body() signInDto: SignInRequestDto): Promise<ResponseModel<SignInResponseDto>> {
    return this.authService.signin(signInDto);
  }

  @Get('authorised')
  @UseGuards(JwtAuthGuard)
  async authUser(@Req() req: Request, @User() user) {
    console.log('Im authorised', user)
    return user;
    // return this.authService.signin(signInDto);
  }


  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async invalidateToken(@User() user: UserData) {
    return await this.authService.invalidateToken(user);
  }
}
