import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  headPic: string;

  @ApiProperty()
  nickName: string;
}
