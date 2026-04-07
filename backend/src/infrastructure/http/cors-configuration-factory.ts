import cors, { CorsOptions } from 'cors';

export function createCorsMiddleware(allowedOrigins: string[]) {
    const corsOptions: CorsOptions = {
        origin: (requestOrigin, callback) => {
            if (!requestOrigin) {
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(requestOrigin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Origem não permitida pelo CORS.'));
        },
        credentials: true,
    };

    return cors(corsOptions);
}
