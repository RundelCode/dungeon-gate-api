import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RacesService } from './races.service';

@UseGuards(JwtAuthGuard)
@Controller('races')
export class RacesController {
    constructor(
        private readonly racesService: RacesService,
    ) { }

    @Get()
    findAll() {
        return this.racesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.racesService.findOne(id);
    }
}
