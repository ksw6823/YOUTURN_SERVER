import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { GenderEntityEnum } from '../entities/information.entity';

export class CreateInformationDto {
	@Type(() => Number)
	@IsInt()
	user_id: number;

	@IsEnum(GenderEntityEnum)
	gender: GenderEntityEnum;

	@IsDateString()
	birth_date: string;

	@IsString()
	address: string;

	@IsString()
	occupation: string;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	budget: number;

	@IsString()
	family_member: string;

	@IsString()
	@IsOptional()
	preferred_crops?: string;

	@IsString()
	@IsOptional()
	preferred_region?: string;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	farming_experience?: number;

	@IsString()
	@IsOptional()
	etc?: string;
}


