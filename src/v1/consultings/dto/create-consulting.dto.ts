import { IsInt, IsString } from 'class-validator';

export class CreateConsultingDto {
  @IsInt()
  information_id: number;

  @IsString()
  content: string; // 마크다운 형식의 컨설팅 내용
}
