import { IsInt, IsOptional, IsIn, IsString } from 'class-validator';

export class SavingThrowDto {
    @IsInt()
    dc: number;

    @IsOptional()
    @IsInt()
    modifier?: number;

    @IsOptional()
    @IsString()
    ability?: string;

    @IsOptional()
    @IsIn(['normal', 'advantage', 'disadvantage'])
    roll_mode?: 'normal' | 'advantage' | 'disadvantage';
}
