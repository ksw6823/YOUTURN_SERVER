import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum GenderEntityEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int' })
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

  @Column({ name: 'funds', type: 'int' })
  funds: number;

  @Column({ name: 'family_member', type: 'varchar', length: 255 })
  family_member: string;

  @Column({ name: 'preferred_crop', type: 'varchar', length: 255 })
  preferred_crop: string;

  @Column({ name: 'preferred_area', type: 'varchar', length: 255 })
  preferred_area: string;

  @Column({ name: 'move_period', type: 'timestamp' })
  move_period: Date;

  @Column({ name: 'farming_experience', type: 'int' })
  farming_experience: number;

  // 로그인용 추가 컬럼
  @Column({ name: 'login_id', type: 'varchar', length: 255, unique: true })
  login_id: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash: string;

  // refresh token 해시 저장
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refresh_token_hash: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}


