import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';
export class CreateConsultingDto {
  @Type(() => Number)
  @IsInt()
  information_id: number;

  @IsString()
  recommended_area: string;

  @IsString()
  recommended_crop: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimated_earnings: number;

  @IsString()
  related_policies: string;

  @IsString()
  fund_use_plan: string;

  @IsString()
  roadmap: string;

  @IsString()
  cultivation_guide: string;
}


