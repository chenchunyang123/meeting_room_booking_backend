import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
}
