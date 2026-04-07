"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./infrastructure/config/load-environment");
const app_1 = require("./app");
const environment_configuration_1 = require("./infrastructure/config/environment-configuration");
const load_environment_1 = require("./infrastructure/config/load-environment");
const mongoose_connection_1 = require("./infrastructure/database/mongoose-connection");
const application_dependencies_1 = require("./infrastructure/dependency-injection/application-dependencies");
async function bootstrapServer() {
    const environmentFilePath = (0, load_environment_1.getEnvironmentFilePathUsed)();
    process.stdout.write(`Inicializando backend. Ambiente: ${environment_configuration_1.environmentConfiguration.nodeEnvironment}. ` +
        `Arquivo .env: ${environmentFilePath ?? 'não localizado (usando apenas variáveis do sistema)'}\n`);
    process.stdout.write(`Configuração carregada. Porta HTTP: ${environment_configuration_1.environmentConfiguration.serverPort}. ` +
        `Origens CORS permitidas (${environment_configuration_1.environmentConfiguration.corsAllowedOrigins.length}): ` +
        `${environment_configuration_1.environmentConfiguration.corsAllowedOrigins.join(', ')}\n`);
    await (0, mongoose_connection_1.connectToDatabase)();
    const applicationDependencies = (0, application_dependencies_1.createApplicationDependencies)();
    await applicationDependencies.defaultPlansSeedingApplicationService.seedDefaultPlansIfNeeded();
    const application = (0, app_1.createApplication)(applicationDependencies);
    application.listen(environment_configuration_1.environmentConfiguration.serverPort, () => {
        process.stdout.write(`Servidor HTTP escutando em http://localhost:${environment_configuration_1.environmentConfiguration.serverPort} ` +
            `(ambiente ${environment_configuration_1.environmentConfiguration.nodeEnvironment}).\n`);
    });
}
bootstrapServer().catch((error) => {
    const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao inicializar o backend.';
    process.stderr.write(`Encerrando processo por falha na inicialização: ${errorMessage}\n`);
    process.exit(1);
});
