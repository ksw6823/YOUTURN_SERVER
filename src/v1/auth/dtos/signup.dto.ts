import { IsString, IsEnum, MinLength, IsDateString } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class SignupDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  occupation: string;

  @IsDateString()
  birth_date: string;
}


