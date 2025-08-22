import { IsString, IsDateString, IsInt, IsEnum, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from './login.dto';

export class SignupDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  occupation: string;

  @IsDateString()
  birth_date: string;

  @Type(() => Number)
  @IsInt()
  funds: number;

  @IsString()
  family_member: string;

  @IsString()
  preferred_crop: string;

  @IsString()
  preferred_area: string;

  @IsDateString()
  move_period: string;

  @Type(() => Number)
  @IsInt()
  farming_experience: number;
}


