import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Information } from '../../information/entities/information.entity';

@Entity({ name: 'consulting' })
export class Consulting {
  @PrimaryGeneratedColumn({ name: 'consulting_id', type: 'int' })
  consulting_id: number;

  @ManyToOne(() => Information, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'information_id',
    referencedColumnName: 'information_id',
  })
  information_id: Information;

  // 🚀 LLM 응답 내용을 마크다운 텍스트로 저장
  @Column({ name: 'content', type: 'text', nullable: true })
  content: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
