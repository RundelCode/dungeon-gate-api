import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Param,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadUserAvatar(
      req.user.id,
      file,
    );
  }

  @Post('games/:gameId/scenes/:sceneId')
  @UseInterceptors(FileInterceptor('file'))
  uploadScene(
    @Param('gameId') gameId: string,
    @Param('sceneId') sceneId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadSceneImage(
      gameId,
      sceneId,
      file,
    );
  }

  @Post('games/:gameId/maps/:mapId')
  @UseInterceptors(FileInterceptor('file'))
  uploadMap(
    @Param('gameId') gameId: string,
    @Param('mapId') mapId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadMapImage(
      gameId,
      mapId,
      file,
    );
  }

  @Post('games/:gameId/tokens/:tokenId')
  @UseInterceptors(FileInterceptor('file'))
  uploadToken(
    @Param('gameId') gameId: string,
    @Param('tokenId') tokenId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadTokenImage(
      gameId,
      tokenId,
      file,
    );
  }

  @Post('games/:gameId/cover')
  @UseInterceptors(FileInterceptor('file'))
  uploadGameCover(
    @Param('gameId') gameId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadGameCover(
      gameId,
      file,
    )
  }
}
