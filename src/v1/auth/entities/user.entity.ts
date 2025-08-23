import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'nickname', type: 'varchar', length: 255 })
  nickname: string;

  @Column({ name: 'login_id', type: 'varchar', length: 255, unique: true })
  login_id: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;
}
