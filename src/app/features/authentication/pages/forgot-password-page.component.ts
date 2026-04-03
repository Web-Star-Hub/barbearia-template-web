import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot-password-page',
    standalone: true,
    imports: [RouterLink],
    template: `
        <section class="authentication-shell">
            <h2>Recuperar senha</h2>
            <p>
                Para o template base, a recuperacao de senha pode ser integrada com seu
                provedor de SMS.
            </p>
            <a routerLink="/login">Voltar para login</a>
        </section>
    `,
})
export class ForgotPasswordPageComponent {}
