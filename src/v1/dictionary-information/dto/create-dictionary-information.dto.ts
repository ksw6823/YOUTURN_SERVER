import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { GenderEntityEnum } from '../../auth/entities/user.entity';

export class CreateDictionaryInformationDto {
	@Type(() => Number)
	@IsInt()
	user_id: number;

	@IsString()
	name: string;

	@IsEnum(GenderEntityEnum)
	gender: GenderEntityEnum;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	funds: number;

	@IsString()
	family_member: string;

	@IsString()
	@IsOptional()
	preferred_crop?: string;

	@IsString()
	@IsOptional()
	preferred_area?: string;

	@IsDateString()
	@IsOptional()
	move_period?: string;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	farming_experience?: number;
}


