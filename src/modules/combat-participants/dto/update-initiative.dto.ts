import { IsInt } from 'class-validator';

export class UpdateInitiativeDto {
    @IsInt()
    initiative: number;
}
