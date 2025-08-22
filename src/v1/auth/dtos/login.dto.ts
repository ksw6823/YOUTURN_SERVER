import { IsString, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class LoginDto {
  @IsString()
  login_id: string;
}

