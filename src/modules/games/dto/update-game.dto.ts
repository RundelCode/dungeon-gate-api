import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string; // active | paused | archived

  @IsOptional()
  @IsInt()
  @Min(1)
  max_players?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
