import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/user.dto';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('register_captcha')
  async sendEmail(@Query('email') email: string) {
    return this.emailService.sendEmail({
      to: email,
      subject: '注册验证码',
      text: '您的注册验证码是：123456',
    });
  }
}
