import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consulting } from './entities/consulting.entity';
import { Information } from '../information/entities/information.entity';
import { User } from '../auth/entities/user.entity';
import { ConsultingsService } from './consultings.service';
import { ConsultingsController } from './consultings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consulting, Information, User])],
  providers: [ConsultingsService],
  controllers: [ConsultingsController],
})
export class ConsultingsModule {}


