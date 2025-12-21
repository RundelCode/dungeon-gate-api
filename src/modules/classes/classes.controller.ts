import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ClassesService } from './classes.service';

@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
    constructor(
        private readonly classesService: ClassesService,
    ) { }

    @Get()
    findAll() {
        return this.classesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.classesService.findOne(id);
    }
}
