import { Inject, Injectable, Logger } from '@nestjs/common';
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
        
  }
}
