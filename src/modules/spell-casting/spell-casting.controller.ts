import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { SpellCastingService } from './spell-casting.service';
import { CastSpellDto } from './dto/cast-spell.dto';

@Controller('games/:gameId/spells')
export class SpellCastingController {
    constructor(
        private readonly service: SpellCastingService,
    ) { }

    @Post('cast')
    cast(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: CastSpellDto,
    ) {
        return this.service.cast(
            gameId,
            req.user.id,
            dto,
        );
    }
}
