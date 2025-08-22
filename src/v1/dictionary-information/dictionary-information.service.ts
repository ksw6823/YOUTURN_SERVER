import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictionaryInformation } from './entities/dictionary-information.entity';
import { User } from '../auth/entities/user.entity';
import { CreateDictionaryInformationDto } from './dto/create-dictionary-information.dto';

@Injectable()
export class DictionaryInformationService {
  constructor(
    @InjectRepository(DictionaryInformation) private readonly diRepo: Repository<DictionaryInformation>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateDictionaryInformationDto) {
    const user = await this.userRepo.findOne({ where: { user_id: dto.user_id } });
    if (!user) throw new NotFoundException('User not found for given user_id');

    const di = this.diRepo.create({
      user,
      name: dto.name,
      gender: dto.gender,
      funds: dto.funds,
      family_member: dto.family_member,
      preferred_crop: dto.preferred_crop,
      preferred_area: dto.preferred_area,
      ...(dto.move_period ? { move_period: new Date(dto.move_period) } : {}),
      ...(dto.farming_experience !== undefined ? { farming_experience: dto.farming_experience } : {}),
    });
    const saved = await this.diRepo.save(di);
    return { information_id: saved.information_id };
  }
}


