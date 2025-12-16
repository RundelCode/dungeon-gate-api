import {
    Controller,
    Get,
    Patch,
    Delete,
    Req,
    Body,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    me(@Req() req) {
        return this.usersService.findById(req.user.id);
    }

    @Patch('me')
    update(@Req() req, @Body() dto: UpdateUserDto) {
        return this.usersService.update(req.user.id, dto);
    }

    @Get('me/games')
    myGames(@Req() req) {
        return this.usersService.getGames(req.user.id);
    }

    @Get('me/characters')
    myCharacters(@Req() req) {
        return this.usersService.getCharacters(req.user.id);
    }

    @Delete('me')
    deactivate(@Req() req) {
        return this.usersService.deactivate(req.user.id);
    }
}
