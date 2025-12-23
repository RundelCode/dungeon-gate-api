import {
    Injectable,
    BadRequestException,
    Inject,
    InternalServerErrorException,
} from '@nestjs/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

@Injectable()
export class UploadsService {
    private readonly BUCKET = 'dungeongate'

    constructor(
        @Inject('SUPABASE_SERVICE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }


    private validateImage(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required')
        }

        if (!file.mimetype?.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed')
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('Image too large (max 5MB)')
        }
    }


    private async uploadImage(
        path: string,
        file: Express.Multer.File,
    ): Promise<string> {
        this.validateImage(file)

        const { error } = await this.supabase.storage
            .from(this.BUCKET)
            .upload(path, file.buffer, {
                contentType: file.mimetype,
                upsert: false, // 👈 IMPORTANTE
            })

        if (error) {
            throw new InternalServerErrorException(error.message)
        }

        const { data } = this.supabase.storage
            .from(this.BUCKET)
            .getPublicUrl(path)

        return data.publicUrl
    }


    uploadUserAvatar(userId: string, file: Express.Multer.File) {
        const path = `avatars/${userId}.png`
        return this.uploadImage(path, file)
    }


    uploadSceneImage(
        gameId: string,
        sceneId: string,
        file: Express.Multer.File,
    ) {
        const path = `games/${gameId}/scenes/${sceneId}.png`
        return this.uploadImage(path, file)
    }


    uploadMapImage(
        gameId: string,
        mapId: string,
        file: Express.Multer.File,
    ) {
        const path = `games/${gameId}/maps/${mapId}.png`
        return this.uploadImage(path, file)
    }


    uploadTokenImage(
        gameId: string,
        tokenId: string,
        file: Express.Multer.File,
    ) {
        const path = `games/${gameId}/tokens/${tokenId}.png`
        return this.uploadImage(path, file)
    }


    async uploadGameCover(
        gameId: string,
        file: Express.Multer.File,
    ): Promise<{ url: string }> {
        this.validateImage(file)

        const ext = file.originalname.split('.').pop() || 'png'
        const filename = `cover-${randomUUID()}.${ext}`
        const path = `games/${gameId}/${filename}`

        const { error } = await this.supabase.storage
            .from(this.BUCKET)
            .upload(path, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            })

        if (error) {
            throw new InternalServerErrorException(error.message)
        }

        const { data } = this.supabase.storage
            .from(this.BUCKET)
            .getPublicUrl(path)

        return { url: data.publicUrl }
    }
}
