import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
  ) {}

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('register_captcha')
  async sendEmail(@Query('email') email: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${email}`, code, 60 * 5);
    await this.emailService.sendEmail({
      to: email,
      subject: '注册验证码',
      text: `您的注册验证码是：${code}`,
    });
    return '发送成功';
  }
}
