import './infrastructure/config/load-environment';

import { createApplication } from './app';
import { environmentConfiguration } from './infrastructure/config/environment-configuration';
import { getEnvironmentFilePathUsed } from './infrastructure/config/load-environment';
import { connectToDatabase } from './infrastructure/database/mongoose-connection';
import { createApplicationDependencies } from './infrastructure/dependency-injection/application-dependencies';

async function bootstrapServer(): Promise<void> {
    const environmentFilePath = getEnvironmentFilePathUsed();

    process.stdout.write(
        `Inicializando backend. Ambiente: ${environmentConfiguration.nodeEnvironment}. ` +
            `Arquivo .env: ${environmentFilePath ?? 'não localizado (usando apenas variáveis do sistema)'}\n`
    );

    process.stdout.write(
        `Configuração carregada. Porta HTTP: ${environmentConfiguration.serverPort}. ` +
            `Origens CORS permitidas (${environmentConfiguration.corsAllowedOrigins.length}): ` +
            `${environmentConfiguration.corsAllowedOrigins.join(', ')}\n`
    );

    await connectToDatabase();

    const applicationDependencies = createApplicationDependencies();

    await applicationDependencies.defaultPlansSeedingApplicationService.seedDefaultPlansIfNeeded();

    const application = createApplication(applicationDependencies);

    application.listen(environmentConfiguration.serverPort, () => {
        process.stdout.write(
            `Servidor HTTP escutando em http://localhost:${environmentConfiguration.serverPort} ` +
                `(ambiente ${environmentConfiguration.nodeEnvironment}).\n`
        );
    });
}

bootstrapServer().catch((error) => {
    const errorMessage =
        error instanceof Error ? error.message : 'Erro inesperado ao inicializar o backend.';

    process.stderr.write(`Encerrando processo por falha na inicialização: ${errorMessage}\n`);
    process.exit(1);
});
