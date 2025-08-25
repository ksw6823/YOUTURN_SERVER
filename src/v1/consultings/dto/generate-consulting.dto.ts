import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GenerateConsultingDto {
  @Type(() => Number)
  @IsInt()
  information_id: number;
}
