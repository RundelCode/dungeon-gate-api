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
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@UseGuards(JwtAuthGuard)
@Controller('characters')
export class CharactersController {
    constructor(
        private readonly charactersService: CharactersService,
    ) { }

    @Post()
    create(@Req() req, @Body() dto: CreateCharacterDto) {
        return this.charactersService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Req() req) {
        return this.charactersService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
        return this.charactersService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateCharacterDto,
    ) {
        return this.charactersService.update(id, req.user.id, dto);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.charactersService.remove(id, req.user.id);
    }
}
