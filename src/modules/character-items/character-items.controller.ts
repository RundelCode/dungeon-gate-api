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
import { CharacterItemsService } from './character-items.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateCharacterItemDto } from './dto/update-character-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('characters/:characterId/items')
export class CharacterItemsController {
    constructor(
        private readonly characterItemsService: CharacterItemsService,
    ) { }

    @Post()
    addItem(
        @Req() req,
        @Param('characterId') characterId: string,
        @Body() dto: AddItemDto,
    ) {
        return this.characterItemsService.addItem(
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
        return this.characterItemsService.findAll(
            characterId,
            req.user.id,
        );
    }

    @Patch(':characterItemId')
    update(
        @Req() req,
        @Param('characterItemId') characterItemId: string,
        @Body() dto: UpdateCharacterItemDto,
    ) {
        return this.characterItemsService.update(
            characterItemId,
            req.user.id,
            dto,
        );
    }

    @Delete(':characterItemId')
    remove(
        @Req() req,
        @Param('characterItemId') characterItemId: string,
    ) {
        return this.characterItemsService.remove(
            characterItemId,
            req.user.id,
        );
    }
}
