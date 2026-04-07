"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentFilePathUsed = getEnvironmentFilePathUsed;
const dotenv_1 = __importDefault(require("dotenv"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const candidateEnvironmentFilePaths = [
    (0, node_path_1.resolve)(process.cwd(), '.env'),
    (0, node_path_1.resolve)(process.cwd(), 'backend', '.env'),
];
let environmentFilePathUsed = null;
for (const candidatePath of candidateEnvironmentFilePaths) {
    if ((0, node_fs_1.existsSync)(candidatePath)) {
        const loadResult = dotenv_1.default.config({ path: candidatePath });
        if (loadResult.error) {
            throw new Error(`Falha ao carregar o arquivo de ambiente em ${candidatePath}: ${loadResult.error.message}`);
        }
        environmentFilePathUsed = candidatePath;
        break;
    }
}
if (!environmentFilePathUsed) {
    process.stderr.write('Aviso: nenhum arquivo .env encontrado nos caminhos esperados. ' +
        'Variáveis devem vir do sistema operacional ou de um .env na pasta do backend.\n');
}
function getEnvironmentFilePathUsed() {
    return environmentFilePathUsed;
}
