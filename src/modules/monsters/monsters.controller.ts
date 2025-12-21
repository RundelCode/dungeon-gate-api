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
import { MonstersService } from './monsters.service';
import { CreateMonsterDto } from './dto/create-monster.dto';
import { UpdateMonsterDto } from './dto/update-monster.dto';

@UseGuards(JwtAuthGuard)
@Controller('monsters')
export class MonstersController {
    constructor(
        private readonly monstersService: MonstersService,
    ) { }

    @Post()
    create(@Body() dto: CreateMonsterDto) {
        return this.monstersService.create(dto);
    }

    @Get()
    findAll() {
        return this.monstersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.monstersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateMonsterDto,
    ) {
        return this.monstersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.monstersService.remove(id);
    }
}
