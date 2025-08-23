import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Information } from './entities/information.entity';
import { User } from '../auth/entities/user.entity';
import { CreateInformationDto } from './dto/create-information.dto';

@Injectable()
export class InformationService {
  constructor(
    @InjectRepository(Information)
    private readonly diRepo: Repository<Information>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateInformationDto) {
    const user = await this.userRepo.findOne({
      where: { user_id: dto.user_id },
    });
    if (!user) throw new NotFoundException('User not found for given user_id');

    const di = this.diRepo.create({
      user,
      gender: dto.gender,
      birth_date: new Date(dto.birth_date),
      address: dto.address,
      occupation: dto.occupation,
      budget: dto.budget,
      family_member: dto.family_member,
      preferred_crops: dto.preferred_crops,
      preferred_region: dto.preferred_region,
      farming_experience: dto.farming_experience,
      etc: dto.etc,
    });
    const saved = await this.diRepo.save(di);
    return { information_id: saved.information_id };
  }
}
