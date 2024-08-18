import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, UserResponseDto, SignInRequestDto, SignInResponseDto, UserRole } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './interfaces/refresh-token.interface';
import * as crypto from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserData } from './interfaces/user-data.interface';
import { sendSMS } from './common/twilio';
import { generateOTP } from './common/codeGenerator';
import { getExpiry } from './common/dateTimeUtility';
import { ResendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ResponseModel } from './common/responseModel';
import { stringToEnum } from './common/util';
// import { ResponseModel } from './common/responseModel';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
  ) { }

  async signup(createUserDto: CreateUserDto): Promise<ResponseModel<UserResponseDto>> {

    let response: ResponseModel<UserResponseDto> = new ResponseModel<UserResponseDto>();

    try {

   
    

      const { firstName, lastName, email, password, dob } =
        createUserDto;
      let returnedUser: User;
      const existingUser = await this.userModel.findOne({ email });

      if (existingUser && existingUser.isVerified) {
        response.setErrorWithData('User with this Email already registered', true, createUserDto)
        return response;
      }

      const hashedPassword = await bcrypt.hash(password, 10);


      //let userRole: UserRole = <UserRole>role;

  
      if (existingUser && !existingUser.isVerified) {
        existingUser.password = hashedPassword;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;


    

        await existingUser.save();
        returnedUser = existingUser;
      } else {
        const newUser = new this.userModel({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          dob,

        });
    
        await newUser.save();
        returnedUser = newUser;
      }

 
      let userResponse: UserResponseDto = this.generateUserResponse(returnedUser);
      response.setSuccessAndData(userResponse, 'User Signup Succesfully');
      return response;
    }
    catch (exception: any) {
      console.error("error => ", exception);
      response.setErrorWithData('Unexpedted error!', true, createUserDto)
      return response;
    }

  }

  async signin(signInRequestDto: SignInRequestDto): Promise<ResponseModel<SignInResponseDto>> {

    let response: ResponseModel<SignInResponseDto> = new ResponseModel<SignInResponseDto>();

    const { email, password } = signInRequestDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      response.setErrorWithData('Invalid email or password', true, signInRequestDto)
      return response;
    }

    let isAppUserRole: boolean = (stringToEnum(user.role) === UserRole.Customer ||
      stringToEnum(user.role) === UserRole.Business);

    if (isAppUserRole && !user.isVerified) {
      response.setErrorWithData('Please verify your OTP to login', true, signInRequestDto)
      return response;
    }

    const payload = { sub: user._id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // Generate a refresh token
    const refreshToken = await this.generateRefreshToken(user, null);

    let signInResponse: SignInResponseDto = { accessToken: accessToken, refreshToken: refreshToken };
    response.setSuccessAndData(signInResponse, 'User Signin Succesfully');
    return response;
  }



  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmail(email);

    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async generateRefreshToken(
    user: User | null,
    refreshToken: string | null,
  ): Promise<RefreshToken> {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 30); // Set an expiration date for the refresh token (e.g., 30 days)

    const token = await this.generateRefreshTokenString(); // Implement this function to generate a unique token
    let refreshTokenResp;

    if (refreshToken) {
      refreshTokenResp = this.refreshTokenModel.findOneAndUpdate(
        { token: refreshToken },
        { expires: expiresIn, token },
        { new: true },
      );
      return refreshTokenResp;
    } else {
      refreshTokenResp = new this.refreshTokenModel({
        token,
        user: user._id,
        expires: expiresIn,
      });
      return await refreshTokenResp.save();
    }
  }

  async generateRefreshTokenString(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      crypto.randomBytes(64, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          const refreshToken = buffer.toString('hex');
          resolve(refreshToken);
        }
      });
    });
  }

  async validateRefreshToken(token: string): Promise<any | null> {
    const refreshToken = await this.refreshTokenModel
      .findOne({
        token,
        expires: { $gt: new Date() }, // Check if the token is not expired
      })
      .populate('user');

    if (refreshToken) {
      return refreshToken.user;
    }

    return null;
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const { refreshToken } = refreshTokenDto;
      const isRefreshTokenValid = await this.validateRefreshToken(refreshToken);

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const payload = {
        sub: isRefreshTokenValid._id,
        email: isRefreshTokenValid.email,
      };
      const access_token = await this.jwtService.signAsync(payload);

      // Now here also have to update refreshToken model.
      const refreshTokenResp = await this.generateRefreshToken(
        null,
        refreshToken,
      );
      return {
        accessToken: access_token,
        refreshToken: refreshTokenResp.token,
      };
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async invalidateToken(userData: UserData): Promise<any> {
    await this.refreshTokenModel.findOneAndDelete({ user: userData._id });
    return { message: 'Token invalidated successfully' };
  }
  async findOne(id: any): Promise<User> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findUserRefreshToken(userId: any): Promise<any> {
    return await this.refreshTokenModel.findOne({ user: userId });
  }

  generateUserResponse(user: User): UserResponseDto {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      dob: user.dob,
    };
  }
}
