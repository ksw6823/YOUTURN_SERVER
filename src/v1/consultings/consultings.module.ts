import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consulting } from './entities/consulting.entity';
import { DictionaryInformation } from '../dictionary-information/entities/dictionary-information.entity';
import { User } from '../auth/entities/user.entity';
import { ConsultingsService } from './consultings.service';
import { ConsultingsController } from './consultings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consulting, DictionaryInformation, User])],
  providers: [ConsultingsService],
  controllers: [ConsultingsController],
})
export class ConsultingsModule {}


