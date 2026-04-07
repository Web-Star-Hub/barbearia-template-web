"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicFileUploadHttpRoutes = createPublicFileUploadHttpRoutes;
const node_fs_1 = require("node:fs");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const http_response_factory_1 = require("../shared/http-response-factory");
const uploadsDirectoryPath = (0, node_path_1.resolve)(process.cwd(), 'uploads');
(0, node_fs_1.mkdirSync)(uploadsDirectoryPath, { recursive: true });
const multerDiskStorage = multer_1.default.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, uploadsDirectoryPath);
    },
    filename: (_request, file, callback) => {
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        callback(null, `${(0, node_crypto_1.randomUUID)()}-${safeOriginalName}`);
    },
});
const profileImageUploadMiddleware = (0, multer_1.default)({
    storage: multerDiskStorage,
    limits: { fileSize: 3 * 1024 * 1024 },
});
function createPublicFileUploadHttpRoutes() {
    const publicFileUploadRouter = (0, express_1.Router)();
    publicFileUploadRouter.post('/profile-image', profileImageUploadMiddleware.single('image'), (request, response) => {
        const uploadedFile = request.file;
        if (!uploadedFile) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'PUBLIC_FILE_UPLOAD_MISSING_FILE', 'Nenhum arquivo enviado no campo image.', 'Selecione uma imagem antes de enviar.', 400);
        }
        const publicProfileImageUrl = `${request.protocol}://${request.get('host')}/uploads/${uploadedFile.filename}`;
        return (0, http_response_factory_1.sendSuccessResponse)(response, { profileImageUrl: publicProfileImageUrl });
    });
    return publicFileUploadRouter;
}
