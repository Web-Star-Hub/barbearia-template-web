export function formatDateTimeLabel(dateTimeIsoString: string): string {
    return new Date(dateTimeIsoString).toLocaleString('pt-BR');
}
