import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn({
    comment: '用户ID',
  })
  id: number;

  @Column({
    length: 50,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    length: 50,
    name: 'nick_name',
    comment: '昵称',
  })
  nickName: string;

  @Column({
    length: 50,
    nullable: true,
    comment: '邮箱',
  })
  email: string;

  @Column({
    length: 100,
    name: 'head_pic',
    nullable: true,
    comment: '头像',
  })
  headPic: string;

  @Column({
    length: 20,
    name: 'phone_number',
    nullable: true,
    comment: '手机号',
  })
  phoneNumber: string;

  @Column({
    name: 'is_frozen',
    default: false,
    comment: '是否被冻结',
  })
  isFrozen: boolean;

  @Column({
    name: 'is_admin',
    default: false,
    comment: '是否是管理员',
  })
  isAdmin: boolean;

  @CreateDateColumn({
    name: 'create_time',
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    comment: '更新时间',
  })
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];
}
