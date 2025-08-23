import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Information } from '../../information/entities/information.entity';

@Entity({ name: 'consulting' })
export class Consulting {
  @PrimaryGeneratedColumn({ name: 'consulting_id', type: 'int' })
  consulting_id: number;

  @ManyToOne(() => Information, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'information_id', referencedColumnName: 'information_id' })
  information_id: Information;

  @Column({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @Column({ name: 'result', type: 'varchar', length: 255 })
  result: string;
}
