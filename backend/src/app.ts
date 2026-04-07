import express from 'express';
import { resolve } from 'node:path';
import { environmentConfiguration } from './infrastructure/config/environment-configuration';
import { ApplicationDependencies } from './infrastructure/dependency-injection/application-dependencies';
import { createCorsMiddleware } from './infrastructure/http/cors-configuration-factory';
import { createApiRouter } from './interfaces/http/routes';

export function createApplication(applicationDependencies: ApplicationDependencies) {
    const application = express();

    const publicUploadsDirectoryPath = resolve(process.cwd(), 'uploads');

    application.use(createCorsMiddleware(environmentConfiguration.corsAllowedOrigins));
    application.use('/uploads', express.static(publicUploadsDirectoryPath));
    application.use(express.json({ limit: '1mb' }));
    application.use('/api/v1', createApiRouter(applicationDependencies));

    return application;
}
