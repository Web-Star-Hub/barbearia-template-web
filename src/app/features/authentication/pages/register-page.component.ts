import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationApiService } from '../services/authentication-api.service';
import { normalizePhoneNumber } from '../../../shared/utils/phone-formatter.util';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
        <section class="authentication-shell">
            <h2>Criar conta</h2>
            <form [formGroup]="registerFormGroup" (ngSubmit)="submitRegister()">
                <label>
                    Nome completo
                    <input type="text" formControlName="fullName" />
                </label>
                <label>
                    Telefone
                    <input type="text" formControlName="phoneNumber" />
                </label>
                <label>
                    Senha
                    <input type="password" formControlName="password" />
                </label>
                <button type="submit" [disabled]="registerFormGroup.invalid || isSubmitting()">
                    Cadastrar
                </button>
            </form>
            <a routerLink="/login">Voltar para login</a>
            <p class="success-message" *ngIf="isSuccess()">Cadastro concluido.</p>
            <p class="error-message" *ngIf="errorMessage()">{{ errorMessage() }}</p>
        </section>
    `,
})
export class RegisterPageComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authenticationApiService = inject(AuthenticationApiService);
    private readonly router = inject(Router);

    protected readonly isSubmitting = signal(false);
    protected readonly isSuccess = signal(false);
    protected readonly errorMessage = signal('');

    protected readonly registerFormGroup = this.formBuilder.group({
        fullName: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    protected submitRegister(): void {
        if (this.registerFormGroup.invalid) {
            return;
        }
        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const formValue = this.registerFormGroup.getRawValue();
        this.authenticationApiService
            .register({
                fullName: formValue.fullName ?? '',
                phoneNumber: normalizePhoneNumber(formValue.phoneNumber ?? ''),
                password: formValue.password ?? '',
            })
            .subscribe({
                next: () => {
                    this.isSuccess.set(true);
                    this.isSubmitting.set(false);
                    setTimeout(() => {
                        this.router.navigateByUrl('/login');
                    }, 800);
                },
                error: (error) => {
                    this.errorMessage.set(
                        error?.error?.userFriendlyMessage ?? 'Falha no cadastro.'
                    );
                    this.isSubmitting.set(false);
                },
            });
    }
}
