"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const environment_configuration_1 = require("../config/environment-configuration");
async function connectToDatabase() {
    const connectionString = environment_configuration_1.environmentConfiguration.databaseConnectionString;
    try {
        mongoose_1.default.set('strictQuery', true);
        await mongoose_1.default.connect(connectionString);
        const mongooseConnection = mongoose_1.default.connection;
        process.stdout.write(`MongoDB conectado com sucesso. Host do banco: ${mongooseConnection.host}. ` +
            `Nome do banco de dados: ${mongooseConnection.name}.\n`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao conectar ao MongoDB.';
        throw new Error(`Falha na conexão com o MongoDB usando MONGODB_URI. Verifique se a URI está correta, ` +
            `se a rede permite acesso ao cluster e se o usuário e senha estão válidos. Detalhes: ${errorMessage}`);
    }
}
