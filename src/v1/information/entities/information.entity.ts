import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User, } from '../../auth/entities/user.entity';

export enum GenderEntityEnum {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

@Entity({ name: 'information' })
export class Information {
  @PrimaryGeneratedColumn({ name: 'information_id', type: 'int' })
  information_id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @Column({ name: 'birth_date', type: 'timestamp' })
  birth_date: Date;

  @Column({ name: 'gender', type: 'enum', enum: GenderEntityEnum })
  gender: GenderEntityEnum;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'occupation', type: 'varchar', length: 255 })
  occupation: string;

  @Column({ name: 'budget', type: 'int' })
  budget: number;

  @Column({ name: 'family_member', type: 'varchar', length: 255 })
  family_member: string;

  @Column({ name: 'preferred_crops', type: 'varchar', length: 255 })
  preferred_crops: string;

  @Column({ name: 'preferred_region', type: 'varchar', length: 255 })
  preferred_region: string;

  @Column({ name: 'farming_experience', type: 'int' })
  farming_experience: number;

  @Column({ name: 'etc', type: 'varchar', length: 255 })
  etc: string;
}


