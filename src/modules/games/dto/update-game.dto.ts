import { IsOptional, IsString, IsInt, Min, IsUrl } from 'class-validator'

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  status?: string // active | paused | archived

  @IsOptional()
  @IsInt()
  @Min(1)
  max_players?: number

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUrl()
  cover_url?: string
}
