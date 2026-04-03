import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyBrl',
    standalone: true,
})
export class CurrencyBrlPipe implements PipeTransform {
    public transform(valueInCents: number): string {
        return (valueInCents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }
}
