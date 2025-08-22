import { IsString, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class LoginDto {
  @Type(() => Number)
  @IsInt()
  user_id: number; // 사용자id

  @IsString()
  name: string; // 이름

  @IsEnum(Gender)
  gender: Gender; // 성별

  @IsString()
  address: string; // 주소

  @IsString()
  occupation: string; // 직업

  @IsDateString()
  birth_date: string; // 생년월일

  @Type(() => Number)
  @IsInt()
  funds: number; // 자금

  @IsString()
  family_member: string; // 가족구성원

  @IsString()
  preferred_crop: string; // 선호작물

  @IsString()
  preferred_area: string; // 선호지역

  @IsDateString()
  move_period: string; // 이주시기

  @Type(() => Number)
  @IsInt()
  farming_experience: number; // 농사경험
}

