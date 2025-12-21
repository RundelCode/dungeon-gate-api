import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CharacterSpellsService } from './character-spells.service';
import { AddSpellDto } from './dto/add-spell.dto';
import { UpdateCharacterSpellDto } from './dto/update-character-spell.dto';

@UseGuards(JwtAuthGuard)
@Controller('characters/:characterId/spells')
export class CharacterSpellsController {
    constructor(
        private readonly characterSpellsService: CharacterSpellsService,
    ) { }

    @Post()
    addSpell(
        @Req() req,
        @Param('characterId') characterId: string,
        @Body() dto: AddSpellDto,
    ) {
        return this.characterSpellsService.addSpell(
            characterId,
            req.user.id,
            dto,
        );
    }

    @Get()
    findAll(
        @Req() req,
        @Param('characterId') characterId: string,
    ) {
        return this.characterSpellsService.findAll(
            characterId,
            req.user.id,
        );
    }

    @Patch(':characterSpellId')
    update(
        @Req() req,
        @Param('characterSpellId') characterSpellId: string,
        @Body() dto: UpdateCharacterSpellDto,
    ) {
        return this.characterSpellsService.update(
            characterSpellId,
            req.user.id,
            dto,
        );
    }

    @Delete(':characterSpellId')
    remove(
        @Req() req,
        @Param('characterSpellId') characterSpellId: string,
    ) {
        return this.characterSpellsService.remove(
            characterSpellId,
            req.user.id,
        );
    }
}
