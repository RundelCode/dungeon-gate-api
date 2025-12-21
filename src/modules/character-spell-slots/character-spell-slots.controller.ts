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
import { CharacterSpellSlotsService } from './character-spell-slots.service';
import { CreateSpellSlotDto } from './dto/create-spell-slot.dto';
import { UpdateSpellSlotDto } from './dto/update-spell-slot.dto';

@UseGuards(JwtAuthGuard)
@Controller('characters/:characterId/spell-slots')
export class CharacterSpellSlotsController {
    constructor(
        private readonly slotsService: CharacterSpellSlotsService,
    ) { }

    @Post()
    create(
        @Req() req,
        @Param('characterId') characterId: string,
        @Body() dto: CreateSpellSlotDto,
    ) {
        return this.slotsService.create(
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
        return this.slotsService.findAll(
            characterId,
            req.user.id,
        );
    }

    @Patch(':slotId')
    update(
        @Req() req,
        @Param('slotId') slotId: string,
        @Body() dto: UpdateSpellSlotDto,
    ) {
        return this.slotsService.update(
            slotId,
            req.user.id,
            dto,
        );
    }

    @Delete(':slotId')
    remove(
        @Req() req,
        @Param('slotId') slotId: string,
    ) {
        return this.slotsService.remove(
            slotId,
            req.user.id,
        );
    }
}
