import { IsIn } from 'class-validator';

export class UpdateGameStatusDto {
    @IsIn(['active', 'paused', 'archived'])
    status: 'active' | 'paused' | 'archived';
}
