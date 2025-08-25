import { IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nickname: string;
}
