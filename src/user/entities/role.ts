import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission';

@Entity({
  name: 'roles',
})
export class Role {
  @PrimaryGeneratedColumn({
    comment: '角色ID',
  })
  id: number;

  @Column({
    length: 50,
    comment: '角色名称',
  })
  name: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];
}
