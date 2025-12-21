import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CombatService } from './combats.service';
import { StartCombatDto } from './dto/start-combat.dto';

@UseGuards(JwtAuthGuard)
@Controller('games/:gameId/combat')
export class CombatController {
    constructor(
        private readonly combatService: CombatService,
    ) { }

    @Post('start')
    start(
        @Req() req,
        @Param('gameId') gameId: string,
        @Body() dto: StartCombatDto,
    ) {
        return this.combatService.startCombat(
            gameId,
            req.user.id,
            dto,
        );
    }

    @Get('active')
    getActive(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.combatService.findActiveCombat(
            gameId,
            req.user.id,
        );
    }

    @Patch('next-round')
    nextRound(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.combatService.nextRound(
            gameId,
            req.user.id,
        );
    }

    @Patch('end')
    end(
        @Req() req,
        @Param('gameId') gameId: string,
    ) {
        return this.combatService.endCombat(
            gameId,
            req.user.id,
        );
    }
}
