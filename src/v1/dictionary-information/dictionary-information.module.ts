import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryInformation } from './entities/dictionary-information.entity';
import { DictionaryInformationService } from './dictionary-information.service';
import { DictionaryInformationController } from './dictionary-information.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryInformation, User])],
  providers: [DictionaryInformationService],
  controllers: [DictionaryInformationController],
  exports: [DictionaryInformationService],
})
export class DictionaryInformationModule {}


