import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
} from 'class-validator';

export class CreateTokenDto {
    @IsString()
    kind: string; // character | monster | marker | object

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    actor_in_game_id?: string;

    @IsOptional()
    @IsString()
    icon_url?: string;

    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    @IsOptional()
    @IsNumber()
    z_index?: number;

    @IsOptional()
    @IsBoolean()
    is_visible_to_players?: boolean;
}
