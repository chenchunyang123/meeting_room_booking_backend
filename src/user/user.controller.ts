import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserVo } from './vo/login-user.vo';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateTokens(user: {
    id: number;
    username: string;
    roles: string[];
    permissions: string[];
  }) {
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME'),
      },
    );

    return { accessToken, refreshToken };
  }

  private async refreshTokenHandler(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.id, isAdmin);
      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('token已失效,请重新登录');
    }
  }

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('register_captcha')
  async sendEmail(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);
    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      text: `您的注册验证码是：${code}`,
    });
    return '发送成功';
  }
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto): Promise<LoginUserVo> {
    const vo = await this.userService.login(loginUser);
    const tokens = this.generateTokens(vo.userInfo);
    return { ...vo, ...tokens };
  }
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto): Promise<LoginUserVo> {
    const vo = await this.userService.login(loginUser, true);
    const tokens = this.generateTokens(vo.userInfo);
    return { ...vo, ...tokens };
  }

  @Get('refresh')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    return this.refreshTokenHandler(refreshToken, false);
  }

  @Get('admin/refresh')
  async adminRefreshToken(@Query('refreshToken') refreshToken: string) {
    return this.refreshTokenHandler(refreshToken, true);
  }
}
