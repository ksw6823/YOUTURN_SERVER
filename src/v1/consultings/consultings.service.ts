import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulting } from './entities/consulting.entity';
import { Information } from '../information/entities/information.entity';
import { User } from '../auth/entities/user.entity';
import { CreateConsultingDto } from './dto/create-consulting.dto';

@Injectable()
export class ConsultingsService {
  constructor(
    @InjectRepository(Consulting) private readonly consultingRepo: Repository<Consulting>,
    @InjectRepository(Information) private readonly diRepo: Repository<Information>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateConsultingDto) {
    const information = await this.diRepo.findOne({ where: { information_id: dto.information_id } });
    if (!information)
      throw new NotFoundException('Information not found for given information_id');

    const consulting = this.consultingRepo.create({
      information_id: information,
      result: dto.result,
      created_at: new Date(),
    });
    const saved = await this.consultingRepo.save(consulting);

    return { consulting_id: saved.consulting_id };
  }
}


