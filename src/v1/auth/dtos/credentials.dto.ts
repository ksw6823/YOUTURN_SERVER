import { IsString, MinLength } from 'class-validator';

export class CredentialsDto {
  @IsString()
  login_id: string;

  @IsString()
  @MinLength(8)
  password: string;
}


