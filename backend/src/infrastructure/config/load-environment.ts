import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const candidateEnvironmentFilePaths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'backend', '.env'),
];

let environmentFilePathUsed: string | null = null;

for (const candidatePath of candidateEnvironmentFilePaths) {
    if (existsSync(candidatePath)) {
        const loadResult = dotenv.config({ path: candidatePath });

        if (loadResult.error) {
            throw new Error(
                `Falha ao carregar o arquivo de ambiente em ${candidatePath}: ${loadResult.error.message}`
            );
        }

        environmentFilePathUsed = candidatePath;
        break;
    }
}

if (!environmentFilePathUsed) {
    process.stderr.write(
        'Aviso: nenhum arquivo .env encontrado nos caminhos esperados. ' +
            'Variáveis devem vir do sistema operacional ou de um .env na pasta do backend.\n'
    );
}

export function getEnvironmentFilePathUsed(): string | null {
    return environmentFilePathUsed;
}
