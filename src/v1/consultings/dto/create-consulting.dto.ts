import { IsInt, IsString } from 'class-validator';

export class CreateConsultingDto {
  @IsInt()
  information_id: number;

  @IsString()
  result: string;
}


