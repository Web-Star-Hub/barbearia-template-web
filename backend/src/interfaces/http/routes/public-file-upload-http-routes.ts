import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { Request, Response, Router } from 'express';
import multer from 'multer';
import { sendErrorResponse, sendSuccessResponse } from '../shared/http-response-factory';

const uploadsDirectoryPath = resolve(process.cwd(), 'uploads');

mkdirSync(uploadsDirectoryPath, { recursive: true });

const multerDiskStorage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, uploadsDirectoryPath);
    },
    filename: (_request, file, callback) => {
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        callback(null, `${randomUUID()}-${safeOriginalName}`);
    },
});

const profileImageUploadMiddleware = multer({
    storage: multerDiskStorage,
    limits: { fileSize: 3 * 1024 * 1024 },
});

export function createPublicFileUploadHttpRoutes() {
    const publicFileUploadRouter = Router();

    publicFileUploadRouter.post(
        '/profile-image',
        profileImageUploadMiddleware.single('image'),
        (request: Request, response: Response) => {
            const uploadedFile = request.file;

            if (!uploadedFile) {
                return sendErrorResponse(
                    response,
                    'PUBLIC_FILE_UPLOAD_MISSING_FILE',
                    'Nenhum arquivo enviado no campo image.',
                    'Selecione uma imagem antes de enviar.',
                    400
                );
            }

            const publicProfileImageUrl = `${request.protocol}://${request.get('host')}/uploads/${uploadedFile.filename}`;

            return sendSuccessResponse(response, { profileImageUrl: publicProfileImageUrl });
        }
    );

    return publicFileUploadRouter;
}
