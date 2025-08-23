import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Information } from './entities/information.entity';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Information, User])],
  providers: [InformationService],
  controllers: [InformationController],
  exports: [InformationService],
})
export class InformationModule {}


