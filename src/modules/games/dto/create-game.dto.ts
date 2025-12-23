import { IsString, IsInt, IsOptional, Min, IsUrl } from 'class-validator'

export class CreateGameDto {
    @IsString()
    name: string

    @IsString()
    mode: string

    @IsInt()
    @Min(1)
    max_players: number

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsUrl()
    cover_url?: string
}
