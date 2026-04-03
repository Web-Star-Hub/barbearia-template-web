import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationApiService } from '../services/authentication-api.service';
import { AuthenticationStateService } from '../../../core/services/authentication-state.service';
import { normalizePhoneNumber } from '../../../shared/utils/phone-formatter.util';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
        <section class="authentication-shell">
            <h2>Entrar</h2>
            <form [formGroup]="loginFormGroup" (ngSubmit)="submitLogin()">
                <label>
                    Telefone
                    <input type="text" formControlName="phoneNumber" />
                </label>
                <label>
                    Senha
                    <input type="password" formControlName="password" />
                </label>
                <button type="submit" [disabled]="loginFormGroup.invalid || isSubmitting()">
                    Entrar
                </button>
            </form>
            <a routerLink="/register">Criar conta</a>
            <a routerLink="/forgot-password">Esqueci minha senha</a>
            <p class="error-message" *ngIf="errorMessage()">{{ errorMessage() }}</p>
        </section>
    `,
})
export class LoginPageComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authenticationApiService = inject(AuthenticationApiService);
    private readonly authenticationStateService = inject(AuthenticationStateService);
    private readonly router = inject(Router);

    protected readonly isSubmitting = signal(false);
    protected readonly errorMessage = signal('');

    protected readonly loginFormGroup = this.formBuilder.group({
        phoneNumber: ['', Validators.required],
        password: ['', Validators.required],
    });

    protected submitLogin(): void {
        if (this.loginFormGroup.invalid) {
            return;
        }
        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const formValue = this.loginFormGroup.getRawValue();
        this.authenticationApiService
            .login({
                phoneNumber: normalizePhoneNumber(formValue.phoneNumber ?? ''),
                password: formValue.password ?? '',
            })
            .subscribe({
                next: (response) => {
                    this.authenticationStateService.setSession(
                        response.accessToken,
                        response.user
                    );
                    this.router.navigateByUrl('/agendar');
                    this.isSubmitting.set(false);
                },
                error: (error) => {
                    this.errorMessage.set(
                        error?.error?.userFriendlyMessage ?? 'Falha no login.'
                    );
                    this.isSubmitting.set(false);
                },
            });
    }
}
