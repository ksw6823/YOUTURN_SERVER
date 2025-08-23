import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: '프롬프트는 5000자를 초과할 수 없습니다.' })
  prompt: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  model?: string = 'gpt-oss:20b';
}
