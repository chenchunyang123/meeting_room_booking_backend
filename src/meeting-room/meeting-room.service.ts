import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoom } from './entities/meeting-room.entity';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  async find({
    pageNum,
    pageSize,
    name,
    capacity,
    equipment,
  }: {
    pageNum: number;
    pageSize: number;
    name: string;
    capacity: number;
    equipment: string;
  }) {
    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }

    const [list, total] = await this.meetingRoomRepository.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      where: condition,
    });

    return {
      list,
      total,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.meetingRoomRepository.findOne({
      where: {
        name: meetingRoomDto.name,
      },
    });

    if (room) {
      throw new BadRequestException('会议室名称已存在');
    }

    return await this.meetingRoomRepository.insert(meetingRoomDto);
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const room = await this.meetingRoomRepository.findOne({
      where: {
        id: meetingRoomDto.id,
      },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    room.name = meetingRoomDto.name;
    room.capacity = meetingRoomDto.capacity;
    room.location = meetingRoomDto.location;
    room.equipment = meetingRoomDto.equipment;
    room.description = meetingRoomDto.description;

    return await this.meetingRoomRepository.save(room);
  }

  async findById(id: number) {
    return await this.meetingRoomRepository.findOne({
      where: {
        id,
      },
    });
  }

  async delete(id: number) {
    try {
      await this.meetingRoomRepository.delete(id);
      return '删除成功';
    } catch (e) {
      throw new BadRequestException('删除失败');
    }
  }
}
