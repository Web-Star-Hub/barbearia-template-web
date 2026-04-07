"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentConfiguration = void 0;
const load_environment_1 = require("./load-environment");
function normalizeStringValue(rawValue) {
    if (rawValue === undefined) {
        return '';
    }
    let normalizedValue = rawValue.trim();
    if ((normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) ||
        (normalizedValue.startsWith("'") && normalizedValue.endsWith("'"))) {
        normalizedValue = normalizedValue.slice(1, -1).trim();
    }
    return normalizedValue;
}
function getRequiredEnvironmentVariable(variableName) {
    const rawValue = process.env[variableName];
    const normalizedValue = normalizeStringValue(rawValue);
    if (!normalizedValue) {
        const environmentFileHint = (0, load_environment_1.getEnvironmentFilePathUsed)()
            ? ` (arquivo carregado: ${(0, load_environment_1.getEnvironmentFilePathUsed)()})`
            : '';
        throw new Error(`Variável de ambiente obrigatória ausente ou vazia: ${variableName}${environmentFileHint}. ` +
            `Defina ${variableName} no arquivo .env na pasta backend ou nas variáveis do sistema.`);
    }
    return normalizedValue;
}
function getOptionalEnvironmentVariable(variableName, fallbackValue) {
    const rawValue = process.env[variableName];
    const normalizedValue = normalizeStringValue(rawValue);
    if (!normalizedValue) {
        return fallbackValue;
    }
    return normalizedValue;
}
function getNumberEnvironmentVariable(variableName, fallbackValue) {
    const rawValue = process.env[variableName];
    if (rawValue === undefined || normalizeStringValue(rawValue) === '') {
        return fallbackValue;
    }
    const convertedValue = Number(normalizeStringValue(rawValue));
    if (Number.isNaN(convertedValue)) {
        throw new Error(`A variável de ambiente ${variableName} deve ser um número válido. Valor recebido: ${rawValue}`);
    }
    return convertedValue;
}
function getBooleanEnvironmentVariable(variableName, fallbackValue) {
    const rawValue = process.env[variableName];
    if (rawValue === undefined || normalizeStringValue(rawValue) === '') {
        return fallbackValue;
    }
    const normalizedValue = normalizeStringValue(rawValue).toLowerCase();
    if (['true', '1', 'yes'].includes(normalizedValue)) {
        return true;
    }
    if (['false', '0', 'no'].includes(normalizedValue)) {
        return false;
    }
    throw new Error(`A variável de ambiente ${variableName} deve ser true ou false. Valor recebido: ${rawValue}`);
}
function parseCorsAllowedOrigins() {
    const allowedOriginsRawValue = process.env.CORS_ALLOWED_ORIGINS;
    if (allowedOriginsRawValue === undefined ||
        normalizeStringValue(allowedOriginsRawValue) === '') {
        return ['http://localhost:4200'];
    }
    const originsList = normalizeStringValue(allowedOriginsRawValue)
        .split(',')
        .map((originValue) => originValue.trim())
        .filter((originValue) => originValue.length > 0);
    if (originsList.length === 0) {
        throw new Error('CORS_ALLOWED_ORIGINS está definida mas não contém nenhuma origem válida após o parsing. ' +
            'Use uma lista separada por vírgulas, por exemplo: http://localhost:4200,http://127.0.0.1:4200');
    }
    return originsList;
}
function validateMongoDbConnectionString(connectionString) {
    const trimmedConnectionString = connectionString.trim();
    if (!/^mongodb(\+srv)?:\/\//i.test(trimmedConnectionString)) {
        throw new Error('MONGODB_URI inválida: deve começar com mongodb:// ou mongodb+srv://. ' +
            'Verifique se a URI está completa e sem caracteres estranhos no início.');
    }
}
function validateJwtSecret(secretValue) {
    if (secretValue.length < 8) {
        throw new Error('JWT_SECRET inválido: use pelo menos 8 caracteres por segurança.');
    }
}
function buildEnvironmentConfiguration() {
    const nodeEnvironment = getOptionalEnvironmentVariable('NODE_ENV', 'development');
    const serverPort = getNumberEnvironmentVariable('PORT', 3000);
    const corsAllowedOrigins = parseCorsAllowedOrigins();
    const jwtSecret = getRequiredEnvironmentVariable('JWT_SECRET');
    validateJwtSecret(jwtSecret);
    const jwtExpirationTime = getOptionalEnvironmentVariable('JWT_EXPIRATION_TIME', '1d');
    if (!jwtExpirationTime.trim()) {
        throw new Error('JWT_EXPIRATION_TIME não pode ser uma string vazia. Use um valor como 1d, 12h ou um número em segundos.');
    }
    const databaseConnectionString = getRequiredEnvironmentVariable('MONGODB_URI');
    validateMongoDbConnectionString(databaseConnectionString);
    const businessName = getOptionalEnvironmentVariable('BUSINESS_NAME', 'Barbearia');
    const defaultSlotDurationMinutes = getNumberEnvironmentVariable('DEFAULT_SLOT_DURATION_MINUTES', 30);
    const adminAccessKey = getOptionalEnvironmentVariable('ADMIN_ACCESS_KEY', '');
    const ownerFullName = getOptionalEnvironmentVariable('OWNER_FULL_NAME', '');
    const ownerEmail = getOptionalEnvironmentVariable('OWNER_EMAIL', '');
    const smtpHost = getOptionalEnvironmentVariable('SMTP_HOST', '');
    const smtpPort = getNumberEnvironmentVariable('SMTP_PORT', 587);
    const smtpSecure = getBooleanEnvironmentVariable('SMTP_SECURE', false);
    const smtpUser = getOptionalEnvironmentVariable('SMTP_USER', '');
    const smtpPassword = getOptionalEnvironmentVariable('SMTP_PASSWORD', '');
    const smtpFromEmail = getOptionalEnvironmentVariable('SMTP_FROM_EMAIL', '');
    return {
        nodeEnvironment,
        serverPort,
        corsAllowedOrigins,
        jwtSecret,
        jwtExpirationTime,
        databaseConnectionString,
        businessName,
        defaultSlotDurationMinutes,
        adminAccessKey,
        ownerFullName,
        ownerEmail,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        smtpFromEmail,
    };
}
exports.environmentConfiguration = buildEnvironmentConfiguration();
