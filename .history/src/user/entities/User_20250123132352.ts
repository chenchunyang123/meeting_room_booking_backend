import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 50, select: false }) // select: false 默认查询时不返回密码字段
  password: string;

  @Column({ length: 50, name: 'nick_name', nullable: true })
  nickName: string;

  @Column({ length: 50, nullable: true })
  email: string;

  @Column({ length: 100, name: 'head_pic', nullable: true })
  headPic: string;

  @Column({ length: 20, name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'is_frozen', default: false })
  isFrozen: boolean;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
