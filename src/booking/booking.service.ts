import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  LessThan,
  MoreThan,
  Equal,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;
  async find({
    pageNum,
    pageSize,
    username,
    meetingRoomName,
    meetingRoomPosition,
    bookingTimeRangeStart,
    bookingTimeRangeEnd,
  }: {
    pageNum: number;
    pageSize: number;
    username: string;
    meetingRoomName: string;
    meetingRoomPosition: string;
    bookingTimeRangeStart: number;
    bookingTimeRangeEnd: number;
  }) {
    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }

    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }

    if (meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`);
    }

    if (bookingTimeRangeStart && bookingTimeRangeEnd) {
      condition.startTime = Between(bookingTimeRangeStart, bookingTimeRangeEnd);
    }

    const [list, total] = await this.entityManager.findAndCount(Booking, {
      where: condition,
      relations: {
        user: true,
        room: true,
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      total,
    };
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOne(MeetingRoom, {
      where: {
        id: bookingDto.meetingRoomId,
      },
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const bookingRes = await this.entityManager.findOne(Booking, {
      where: [
        {
          room: { id: meetingRoom.id },
          startTime: LessThanOrEqual(bookingDto.endTime),
          endTime: MoreThanOrEqual(bookingDto.startTime),
        },
      ],
    });

    if (bookingRes) {
      throw new BadRequestException('该时段会议室已被占用');
    }

    const user = await this.entityManager.findOne(User, {
      where: {
        id: userId,
      },
    });

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = bookingDto.startTime;
    booking.endTime = bookingDto.endTime;
    booking.note = bookingDto.note;

    await this.entityManager.save(Booking, booking);
  }

  async apply(id: number) {
    const booking = await this.entityManager.findOne(Booking, {
      where: { id },
    });

    if (!booking) {
      throw new BadRequestException('会议室不存在');
    }

    booking.status = BookingStatus.APPROVED;

    await this.entityManager.save(Booking, booking);

    return 'success';
  }

  async reject(id: number) {
    const booking = await this.entityManager.findOne(Booking, {
      where: { id },
    });

    if (!booking) {
      throw new BadRequestException('会议室不存在');
    }

    booking.status = BookingStatus.REJECTED;

    await this.entityManager.save(Booking, booking);

    return 'success';
  }

  async unbind(id: number) {
    const booking = await this.entityManager.findOne(Booking, {
      where: { id },
    });

    if (!booking) {
      throw new BadRequestException('会议室不存在');
    }

    booking.status = BookingStatus.CANCELLED;

    await this.entityManager.save(Booking, booking);

    return 'success';
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_${id}`);

    if (flag) {
      throw new BadRequestException('半小时内只能催办一次，请耐心等待');
    }

    const admin = await this.entityManager.findOne(User, {
      select: {
        email: true,
      },
      where: {
        isAdmin: true,
      },
    });

    const email = admin?.email;

    this.emailService.sendEmail({
      to: email,
      subject: '会议室催办',
      text: `id 为 ${id} 的预定申请正在等待审批`,
    });

    await this.redisService.set(`urge_${id}`, '1', 60 * 30);
  }
}
