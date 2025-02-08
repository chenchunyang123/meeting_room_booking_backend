import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async userBookingCount(
    startTime: number | undefined,
    endTime: number | undefined,
  ) {
    const query = this.entityManager
      .createQueryBuilder(Booking, 'booking')
      .leftJoin(User, 'user', 'user.id = booking.userId')
      .select('user.id', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(booking.id)', 'bookingCount');

    if (startTime && endTime) {
      query.where('booking.startTime between :startTime and :endTime', {
        startTime,
        endTime,
      });
    }

    const result = await query.groupBy('booking.user').getRawMany();

    return result;
  }

  async meetingRoomUsedCount(
    startTime: number | undefined,
    endTime: number | undefined,
  ) {
    const query = this.entityManager
      .createQueryBuilder(Booking, 'booking')
      .leftJoin(MeetingRoom, 'meetingRoom', 'meetingRoom.id = booking.roomId')
      .select('meetingRoom.id', 'meetingRoomId')
      .addSelect('meetingRoom.name', 'meetingRoomName')
      .addSelect('COUNT(booking.id)', 'usedCount');

    if (startTime && endTime) {
      query.where('booking.startTime between :startTime and :endTime', {
        startTime,
        endTime,
      });
    }

    const result = await query.groupBy('booking.roomId').getRawMany();

    return result;
  }
}
