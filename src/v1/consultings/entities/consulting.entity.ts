import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { DictionaryInformation } from '../../dictionary-information/entities/dictionary-information.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'consultings' })
export class Consulting {
  @PrimaryGeneratedColumn({ name: 'consulting_id', type: 'int' })
  id: number;

  @OneToOne(() => DictionaryInformation, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'information_id', referencedColumnName: 'information_id' })
  dictionaryInformation: DictionaryInformation;

  @Column({ name: 'recommended_area', type: 'varchar', length: 255 })
  recommended_area: string;

  @Column({ name: 'recommended_crop', type: 'varchar', length: 255 })
  recommended_crop: string;

  @Column({ name: 'estimated_earnings', type: 'int' })
  estimated_earnings: number;

  @Column({ name: 'related_policies', type: 'varchar', length: 255 })
  related_policies: string;

  @Column({ name: 'fund_use_plan', type: 'varchar', length: 255 })
  fund_use_plan: string;

  @Column({ name: 'roadmap', type: 'varchar', length: 255 })
  roadmap: string;

  @Column({ name: 'cultivation_guide', type: 'varchar', length: 255 })
  cultivation_guide: string;
}
