import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Consulting } from './entities/consulting.entity';
import { Information } from '../information/entities/information.entity';
import { User } from '../auth/entities/user.entity';
import { ConsultingsService } from './consultings.service';
import { ConsultingsController } from './consultings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consulting, Information, User]),
    HttpModule.register({
      timeout: 70000, // 70초 타임아웃 (LLM 응답 대기)
      maxRedirects: 3,
    }),
  ],
  providers: [ConsultingsService],
  controllers: [ConsultingsController],
  exports: [ConsultingsService],
})
export class ConsultingsModule {}
