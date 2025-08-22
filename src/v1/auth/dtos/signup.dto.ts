import { IsString, IsEnum, MinLength, IsDateString } from 'class-validator';

export class SignupDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nickname: string;
}


