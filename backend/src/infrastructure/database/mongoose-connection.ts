import mongoose from 'mongoose';
import { environmentConfiguration } from '../config/environment-configuration';

export async function connectToDatabase(): Promise<void> {
    const connectionString = environmentConfiguration.databaseConnectionString;

    try {
        mongoose.set('strictQuery', true);

        await mongoose.connect(connectionString);

        const mongooseConnection = mongoose.connection;

        process.stdout.write(
            `MongoDB conectado com sucesso. Host do banco: ${mongooseConnection.host}. ` +
                `Nome do banco de dados: ${mongooseConnection.name}.\n`
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Erro desconhecido ao conectar ao MongoDB.';

        throw new Error(
            `Falha na conexão com o MongoDB usando MONGODB_URI. Verifique se a URI está correta, ` +
                `se a rede permite acesso ao cluster e se o usuário e senha estão válidos. Detalhes: ${errorMessage}`
        );
    }
}
