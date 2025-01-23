import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
