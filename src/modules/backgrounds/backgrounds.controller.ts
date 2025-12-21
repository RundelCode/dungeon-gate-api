import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BackgroundsService } from './backgrounds.service';

@UseGuards(JwtAuthGuard)
@Controller('backgrounds')
export class BackgroundsController {
    constructor(
        private readonly backgroundsService: BackgroundsService,
    ) { }

    @Get()
    findAll() {
        return this.backgroundsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.backgroundsService.findOne(id);
    }
}
