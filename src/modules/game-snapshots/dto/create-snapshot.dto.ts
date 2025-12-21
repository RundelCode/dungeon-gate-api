import { IsString } from 'class-validator';

export class CreateSnapshotDto {
    @IsString()
    label: string;

    state_json: any;
}
