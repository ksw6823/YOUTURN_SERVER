import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum GenderEntityEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true, nullable: true })
  user_id: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'gender', type: 'enum', enum: GenderEntityEnum })
  gender: GenderEntityEnum;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'occupation', type: 'varchar', length: 255 })
  occupation: string;

  @Column({ name: 'birth_date', type: 'timestamp' })
  birth_date: Date;

  // 로그인용 추가 컬럼
  @Column({ name: 'login_id', type: 'varchar', length: 255, unique: true })
  login_id: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash: string;

  // refresh token 해시 저장
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refresh_token_hash: string | null;
}