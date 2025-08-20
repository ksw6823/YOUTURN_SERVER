import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsultingsModule } from './v1/consultings/consultings.module';
import { AuthModule } from './v1/auth/auth.module';
import { DictionaryInformationModule } from './v1/dictionary-information/dictionary-information.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM 데이터베이스 설정 (AWS RDS 전용)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: { rejectUnauthorized: false }, // AWS RDS SSL 필수
    }),
    ConsultingsModule,
    AuthModule,
    DictionaryInformationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
