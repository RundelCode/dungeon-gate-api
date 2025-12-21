import { IsInt } from 'class-validator';

export class UpdateHpDto {
    @IsInt()
    delta: number; // negativo = daño, positivo = curación
}
