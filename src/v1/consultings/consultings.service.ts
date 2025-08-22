import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulting } from './entities/consulting.entity';
import { DictionaryInformation } from '../dictionary-information/entities/dictionary-information.entity';
import { User } from '../auth/entities/user.entity';
import { CreateConsultingDto } from './dto/create-consulting.dto';

@Injectable()
export class ConsultingsService {
  constructor(
    @InjectRepository(Consulting) private readonly consultingRepo: Repository<Consulting>,
    @InjectRepository(DictionaryInformation) private readonly diRepo: Repository<DictionaryInformation>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateConsultingDto) {
    const dictionaryInformation = await this.diRepo.findOne({ where: { information_id: dto.information_id } });
    if (!dictionaryInformation)
      throw new NotFoundException('dictionary_information not found for given information_id');

    const consulting = this.consultingRepo.create({
      dictionaryInformation,
      recommended_area: dto.recommended_area,
      recommended_crop: dto.recommended_crop,
      estimated_earnings: dto.estimated_earnings,
      related_policies: dto.related_policies,
      fund_use_plan: dto.fund_use_plan,
      roadmap: dto.roadmap,
      cultivation_guide: dto.cultivation_guide,
    });
    await this.consultingRepo.save(consulting);

    return { consulting_id: consulting.id };
  }
}


