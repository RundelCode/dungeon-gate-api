import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SpellsService } from './spells.service';
import { CreateSpellDto } from './dto/create-spell.dto';
import { UpdateSpellDto } from './dto/update-spell.dto';

@UseGuards(JwtAuthGuard)
@Controller('spells')
export class SpellsController {
    constructor(
        private readonly spellsService: SpellsService,
    ) { }

    @Post()
    create(@Body() dto: CreateSpellDto) {
        return this.spellsService.create(dto);
    }

    @Get()
    findAll() {
        return this.spellsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.spellsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSpellDto,
    ) {
        return this.spellsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.spellsService.remove(id);
    }
}
