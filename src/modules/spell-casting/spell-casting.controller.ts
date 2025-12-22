import { Controller, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SpellCastingService } from './spell-casting.service';
import { CastSpellDto } from './dto/cast-spell.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/spells/cast')
export class SpellCastingController {
    constructor(private readonly service: SpellCastingService) { }

    @Post()
    cast(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: CastSpellDto,
    ) {
        return this.service.cast(gameId, req.user.id, dto);
    }
}
