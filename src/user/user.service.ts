import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { md5 } from 'src/utils';
import { LoginUserVo } from './vo/login-user.vo';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

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

  async login(loginUser: LoginUserDto, isAdmin: boolean = false) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== md5(loginUser.password)) {
      throw new BadRequestException('密码错误');
    }

    const vo = new LoginUserVo();

    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.findIndex((item) => item.code === permission.code) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  async findUserById(userId: number, isAdmin: boolean = false) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.findIndex((item) => item.code === permission.code) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }
}
