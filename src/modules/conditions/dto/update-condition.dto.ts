import { IsOptional, IsString } from 'class-validator';

export class UpdateConditionDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    source?: string;
}
