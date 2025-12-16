import {
    Injectable,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
    private readonly BUCKET = 'dungeongate';

    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    private validateImage(file: Express.Multer.File) {
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only images are allowed');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('Image too large (max 5MB)');
        }
    }

    async uploadImage(
        path: string,
        file: Express.Multer.File,
    ): Promise<string> {
        this.validateImage(file);

        const { error } = await this.supabase.storage
            .from(this.BUCKET)
            .upload(path, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) throw error;

        const { data } = this.supabase.storage
            .from(this.BUCKET)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    uploadUserAvatar(userId: string, file: Express.Multer.File) {
        return this.uploadImage(
            `avatars/${userId}.png`,
            file,
        );
    }

    uploadSceneImage(
        gameId: string,
        sceneId: string,
        file: Express.Multer.File,
    ) {
        return this.uploadImage(
            `games/${gameId}/scenes/${sceneId}.png`,
            file,
        );
    }

    uploadMapImage(
        gameId: string,
        mapId: string,
        file: Express.Multer.File,
    ) {
        return this.uploadImage(
            `games/${gameId}/maps/${mapId}.png`,
            file,
        );
    }

    uploadTokenImage(
        gameId: string,
        tokenId: string,
        file: Express.Multer.File,
    ) {
        return this.uploadImage(
            `games/${gameId}/tokens/${tokenId}.png`,
            file,
        );
    }
}
