import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @Get('userBookingCount')
  async userBookingCount(
    @Query('startTime') startTime: number | undefined,
    @Query('endTime') endTime: number | undefined,
  ) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: number | undefined,
    @Query('endTime') endTime: number | undefined,
  ) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
