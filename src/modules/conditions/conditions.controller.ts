import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ConditionsService } from './conditions.service';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';

@Controller('conditions')
export class ConditionsController {
    constructor(
        private readonly conditionsService: ConditionsService,
    ) { }

    @Get()
    findAll() {
        return this.conditionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.conditionsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() dto: CreateConditionDto) {
        return this.conditionsService.create(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateConditionDto,
    ) {
        return this.conditionsService.update(
            id,
            req.user.id,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.conditionsService.remove(id, req.user.id);
    }
}
