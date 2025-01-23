import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn({
    comment: '权限ID',
  })
  id: number;
}
