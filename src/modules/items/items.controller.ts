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
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
    ) { }

    @Post()
    create(@Body() dto: CreateItemDto) {
        return this.itemsService.create(dto);
    }

    @Get()
    findAll() {
        return this.itemsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateItemDto,
    ) {
        return this.itemsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemsService.remove(id);
    }
}
