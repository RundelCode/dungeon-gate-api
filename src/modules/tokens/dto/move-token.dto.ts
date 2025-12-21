import { IsNumber, IsOptional } from 'class-validator';

export class MoveTokenDto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    @IsOptional()
    @IsNumber()
    z_index?: number;
}
