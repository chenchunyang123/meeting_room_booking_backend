import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/user.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new BadRequestException('验证码已失效');
    }

    if (captcha !== user.captcha) {
      throw new BadRequestException('验证码错误');
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new BadRequestException('用户已存在');
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.nickName = user.nickName;
    newUser.password = user.password;
    newUser.email = user.email;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }
}

