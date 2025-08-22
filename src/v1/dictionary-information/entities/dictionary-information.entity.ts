import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User, GenderEntityEnum } from '../../auth/entities/user.entity';
// Consulting 관계는 역참조만 필요하면 여기서 명시하지 않아도 됩니다.

@Entity({ name: 'dictionary_information' })
export class DictionaryInformation {
  @PrimaryGeneratedColumn({ name: 'information_id', type: 'int' })
  information_id: number;

  // FK to users.user_id (unique)
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  // Note: Consulting → DictionaryInformation 방향으로 FK를 둡니다.
  // 이 엔티티는 user_id만 FK로 가집니다.

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'gender', type: 'enum', enum: GenderEntityEnum })
  gender: GenderEntityEnum;

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
}


