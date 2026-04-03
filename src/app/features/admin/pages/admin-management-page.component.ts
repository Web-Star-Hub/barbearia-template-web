import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    AppointmentInterface,
    BarberInterface,
    BusinessLocationInterface,
    ServiceCatalogItemInterface,
} from '../../../core/models/domain.models';
import { AdminAccessStateService } from '../../../core/services/admin-access-state.service';
import { SchedulingApiService } from '../../scheduling/services/scheduling-api.service';
import { ServiceCatalogApiService } from '../../service-catalog/services/service-catalog-api.service';
import { AdminApiService } from '../services/admin-api.service';

@Component({
    selector: 'app-admin-management-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <section class="admin-shell">
            <div class="admin-card">
                <h2>Painel Administrativo</h2>
                <p class="admin-description">
                    Gestao de servicos, profissionais e agendamentos
                </p>
                <div class="quick-actions-grid">
                    <button type="button" (click)="openAgendaFilterModal()">
                        Agenda do dia
                    </button>
                    <button type="button" (click)="openCreateServiceModal()">
                        Novo servico
                    </button>
                    <button type="button" (click)="openCreateBarberModal()">
                        Novo profissional
                    </button>
                    <button type="button" (click)="openBusinessLocationModal()">
                        Endereco e mapa
                    </button>
                    <button
                        type="button"
                        class="secondary-action-button"
                        (click)="logoutAdminAccess()"
                    >
                        Sair
                    </button>
                </div>
            </div>

            <div class="summary-grid">
                <section class="admin-card compact-card">
                    <h3>Servicos cadastrados ({{ services().length }})</h3>
                    <div class="registered-item" *ngFor="let serviceCatalogItem of services()">
                        <span>
                            {{ serviceCatalogItem.serviceName }} -
                            R$ {{ formatPriceInReais(serviceCatalogItem.priceInCents) }} -
                            {{ serviceCatalogItem.estimatedDurationInMinutes }}min
                        </span>
                        <button
                            type="button"
                            class="inline-action-button"
                            (click)="openEditServiceModal(serviceCatalogItem.id)"
                        >
                            Editar
                        </button>
                    </div>
                </section>

                <section class="admin-card compact-card">
                    <h3>Profissionais cadastrados ({{ barbers().length }})</h3>
                    <div class="registered-item" *ngFor="let barber of barbers()">
                        <span>
                            {{ barber.fullName }} -
                            {{ barber.workingStartTime }} as {{ barber.workingEndTime }}
                        </span>
                        <button
                            type="button"
                            class="inline-action-button"
                            (click)="openEditBarberModal(barber.id)"
                        >
                            Editar
                        </button>
                    </div>
                </section>
            </div>

            <div class="modal-backdrop" *ngIf="isAgendaFilterModalVisible()">
                <section class="modal-card">
                    <h3>Agenda do dia</h3>
                    <label>
                        Data
                        <input
                            type="date"
                            [ngModel]="appointmentFilterDate()"
                            (ngModelChange)="appointmentFilterDate.set($event)"
                        />
                    </label>
                    <label>
                        Profissional
                        <select
                            [ngModel]="appointmentFilterBarberId()"
                            (ngModelChange)="appointmentFilterBarberId.set($event)"
                        >
                            <option value="">Todos os profissionais</option>
                            <option *ngFor="let barber of barbers()" [ngValue]="barber.id">
                                {{ barber.fullName }}
                            </option>
                        </select>
                    </label>
                    <button type="button" (click)="loadFilteredAppointments()">
                        Filtrar agendamentos
                    </button>

                    <div class="appointment-item" *ngFor="let appointment of filteredAppointments()">
                        <p>
                            {{ formatDateTime(appointment.appointmentDateTime) }} -
                            {{ appointment.customerFullName }} -
                            {{ appointment.customerPhoneNumber }}
                        </p>
                        <p>
                            {{ appointment.serviceName }} -
                            {{ appointment.barberName }} -
                            {{ formatAppointmentStatus(appointment) }}
                        </p>
                        <label *ngIf="appointment.status === 'SCHEDULED'">
                            Motivo do cancelamento por admin
                            <textarea
                                rows="3"
                                [ngModel]="adminCancellationReasonByAppointmentId()[appointment.id] ?? ''"
                                (ngModelChange)="
                                    setAdminCancellationReasonForAppointment(
                                        appointment.id,
                                        $event
                                    )
                                "
                            ></textarea>
                        </label>
                        <button
                            type="button"
                            *ngIf="appointment.status === 'SCHEDULED'"
                            (click)="cancelAppointmentByAdmin(appointment.id)"
                            [disabled]="!canCancelAppointmentByAdmin(appointment.id)"
                        >
                            Cancelar por admin
                        </button>
                    </div>
                    <button
                        type="button"
                        class="secondary-action-button"
                        (click)="closeAgendaFilterModal()"
                    >
                        Fechar agenda
                    </button>
                </section>
            </div>

            <div class="modal-backdrop" *ngIf="isServiceModalVisible()">
                <section class="modal-card">
                    <h3>
                        {{
                            isServiceEditingMode()
                                ? 'Editar servico'
                                : 'Novo servico'
                        }}
                    </h3>
                    <label>
                        Nome do servico
                        <input
                            type="text"
                            [ngModel]="serviceFormName()"
                            (ngModelChange)="serviceFormName.set($event)"
                        />
                    </label>
                    <label>
                        Preco em reais
                        <input
                            type="number"
                            [ngModel]="serviceFormPriceInReais()"
                            (ngModelChange)="serviceFormPriceInReais.set($event)"
                        />
                    </label>
                    <label>
                        Duracao em minutos
                        <input
                            type="number"
                            [ngModel]="serviceFormDurationInMinutes()"
                            (ngModelChange)="serviceFormDurationInMinutes.set($event)"
                        />
                    </label>
                    <div class="action-button-row">
                        <button type="button" (click)="submitServiceForm()">
                            {{
                                isServiceEditingMode()
                                    ? 'Salvar alteracoes'
                                    : 'Cadastrar servico'
                            }}
                        </button>
                        <button
                            type="button"
                            class="secondary-action-button"
                            (click)="closeServiceModal()"
                        >
                            Fechar
                        </button>
                    </div>
                    <button
                        type="button"
                        class="danger-action-button"
                        *ngIf="isServiceEditingMode()"
                        (click)="deleteService()"
                    >
                        Excluir servico
                    </button>
                </section>
            </div>

            <div class="modal-backdrop" *ngIf="isBarberModalVisible()">
                <section class="modal-card">
                    <h3>
                        {{
                            isBarberEditingMode()
                                ? 'Editar profissional'
                                : 'Novo profissional'
                        }}
                    </h3>
                    <label>
                        Nome completo
                        <input
                            type="text"
                            [ngModel]="barberFormFullName()"
                            (ngModelChange)="barberFormFullName.set($event)"
                        />
                    </label>
                    <label>
                        Inicio expediente
                        <input
                            type="time"
                            [ngModel]="barberFormWorkingStartTime()"
                            (ngModelChange)="barberFormWorkingStartTime.set($event)"
                        />
                    </label>
                    <label>
                        Fim expediente
                        <input
                            type="time"
                            [ngModel]="barberFormWorkingEndTime()"
                            (ngModelChange)="barberFormWorkingEndTime.set($event)"
                        />
                    </label>
                    <label>
                        Inicio almoco
                        <input
                            type="time"
                            [ngModel]="barberFormLunchBreakStartTime()"
                            (ngModelChange)="barberFormLunchBreakStartTime.set($event)"
                        />
                    </label>
                    <label>
                        Fim almoco
                        <input
                            type="time"
                            [ngModel]="barberFormLunchBreakEndTime()"
                            (ngModelChange)="barberFormLunchBreakEndTime.set($event)"
                        />
                    </label>
                    <div class="service-selector">
                        <span>Servicos atendidos</span>
                        <label *ngFor="let serviceCatalogItem of services()">
                            <input
                                type="checkbox"
                                [checked]="
                                    barberFormSelectedServiceIds().includes(
                                        serviceCatalogItem.id
                                    )
                                "
                                (change)="toggleBarberFormService(serviceCatalogItem.id)"
                            />
                            {{ serviceCatalogItem.serviceName }}
                        </label>
                    </div>
                    <div class="action-button-row">
                        <button type="button" (click)="submitBarberForm()">
                            {{
                                isBarberEditingMode()
                                    ? 'Salvar alteracoes'
                                    : 'Cadastrar profissional'
                            }}
                        </button>
                        <button
                            type="button"
                            class="secondary-action-button"
                            (click)="closeBarberModal()"
                        >
                            Fechar
                        </button>
                    </div>
                    <button
                        type="button"
                        class="danger-action-button"
                        *ngIf="isBarberEditingMode()"
                        (click)="deleteBarber()"
                    >
                        Excluir profissional
                    </button>
                </section>
            </div>

            <div class="modal-backdrop" *ngIf="isBusinessLocationModalVisible()">
                <section class="modal-card">
                    <h3>Endereco da barbearia</h3>
                    <label>
                        Endereco completo
                        <textarea
                            rows="4"
                            [ngModel]="businessLocationFullAddress()"
                            (ngModelChange)="businessLocationFullAddress.set($event)"
                        ></textarea>
                    </label>
                    <label>
                        Texto para busca no mapa
                        <input
                            type="text"
                            [ngModel]="businessLocationMapQuery()"
                            (ngModelChange)="businessLocationMapQuery.set($event)"
                            placeholder="Opcional"
                        />
                    </label>
                    <div class="action-button-row">
                        <button type="button" (click)="saveBusinessLocation()">
                            Salvar endereco
                        </button>
                        <button
                            type="button"
                            class="secondary-action-button"
                            (click)="closeBusinessLocationModal()"
                        >
                            Fechar
                        </button>
                    </div>
                </section>
            </div>

            <p class="admin-feedback" *ngIf="feedbackMessage()">
                {{ feedbackMessage() }}
            </p>
        </section>
    `,
    styles: `
        .admin-shell {
            display: grid;
            gap: 14px;
        }

        .summary-grid {
            display: grid;
            gap: 14px;
        }

        .admin-description {
            color: var(--color-text-secondary);
            margin: 0;
        }

        .admin-card,
        .modal-card {
            display: grid;
            gap: 10px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            padding: 14px;
            background: linear-gradient(
                165deg,
                rgba(255, 255, 255, 0.04),
                rgba(255, 255, 255, 0.02)
            );
        }

        .compact-card {
            max-height: 320px;
            overflow: auto;
        }

        .modal-card {
            width: min(560px, 94vw);
            max-height: 86vh;
            overflow: auto;
        }

        .quick-actions-grid {
            display: grid;
            gap: 8px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        label {
            display: grid;
            gap: 6px;
        }

        input,
        button,
        select,
        textarea {
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 10px;
            background: var(--color-surface);
            color: var(--color-text);
            padding: 10px;
        }

        textarea {
            min-height: 72px;
            resize: vertical;
        }

        button {
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            color: #1a1a1a;
            font-weight: 700;
            border: none;
            cursor: pointer;
        }

        .service-selector {
            display: grid;
            gap: 6px;
        }

        .service-selector label {
            grid-template-columns: auto 1fr;
            align-items: center;
        }

        .appointment-item {
            display: grid;
            gap: 8px;
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.02);
        }

        .appointment-item p {
            margin: 0;
        }

        .action-button-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .secondary-action-button {
            background: rgba(255, 255, 255, 0.18);
            color: var(--color-text);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .danger-action-button {
            background: linear-gradient(135deg, #9a2020, #cf3f3f);
            color: #ffffff;
        }

        .registered-item {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.02);
        }

        .inline-action-button {
            min-height: 34px;
            padding: 6px 10px;
            font-size: 0.85rem;
        }

        .modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 120;
            background: rgba(5, 5, 10, 0.72);
            backdrop-filter: blur(4px);
            display: grid;
            place-items: center;
            padding: 12px;
        }

        .admin-feedback {
            color: var(--color-primary);
            font-weight: 700;
        }

        @media (max-width: 640px) {
            .quick-actions-grid {
                grid-template-columns: 1fr;
            }

            .action-button-row {
                grid-template-columns: 1fr;
            }

            .modal-card button {
                width: 100%;
            }
        }
    `,
})
export class AdminManagementPageComponent {
    private readonly adminApiService = inject(AdminApiService);
    private readonly schedulingApiService = inject(SchedulingApiService);
    private readonly serviceCatalogApiService = inject(ServiceCatalogApiService);
    private readonly adminAccessStateService = inject(AdminAccessStateService);
    private readonly router = inject(Router);

    protected readonly serviceName = signal('');
    protected readonly servicePriceInReais = signal<number>(40);
    protected readonly serviceDurationInMinutes = signal<number>(30);
    protected readonly barberFullName = signal('');
    protected readonly barberWorkingStartTime = signal('09:00');
    protected readonly barberWorkingEndTime = signal('19:00');
    protected readonly barberLunchBreakStartTime = signal('12:00');
    protected readonly barberLunchBreakEndTime = signal('13:00');
    protected readonly selectedServiceIds = signal<string[]>([]);

    protected readonly services = signal<ServiceCatalogItemInterface[]>([]);
    protected readonly barbers = signal<BarberInterface[]>([]);
    protected readonly businessLocation = signal<BusinessLocationInterface | null>(null);
    protected readonly filteredAppointments = signal<AppointmentInterface[]>([]);
    protected readonly appointmentFilterDate = signal(this.getCurrentDateIsoString());
    protected readonly appointmentFilterBarberId = signal('');
    protected readonly adminCancellationReasonByAppointmentId = signal<
        Partial<Record<string, string>>
    >({});
    protected readonly isAgendaFilterModalVisible = signal(false);

    protected readonly isServiceModalVisible = signal(false);
    protected readonly serviceBeingEditedId = signal('');
    protected readonly serviceFormName = signal('');
    protected readonly serviceFormPriceInReais = signal<number>(40);
    protected readonly serviceFormDurationInMinutes = signal<number>(30);

    protected readonly isBarberModalVisible = signal(false);
    protected readonly barberBeingEditedId = signal('');
    protected readonly barberFormFullName = signal('');
    protected readonly barberFormWorkingStartTime = signal('09:00');
    protected readonly barberFormWorkingEndTime = signal('19:00');
    protected readonly barberFormLunchBreakStartTime = signal('12:00');
    protected readonly barberFormLunchBreakEndTime = signal('13:00');
    protected readonly barberFormSelectedServiceIds = signal<string[]>([]);

    protected readonly isBusinessLocationModalVisible = signal(false);
    protected readonly businessLocationFullAddress = signal('');
    protected readonly businessLocationMapQuery = signal('');

    protected readonly feedbackMessage = signal('');

    protected readonly isServiceEditingMode = computed(
        () => this.serviceBeingEditedId().length > 0
    );
    protected readonly isBarberEditingMode = computed(
        () => this.barberBeingEditedId().length > 0
    );

    constructor() {
        this.reloadData();
    }

    protected openCreateServiceModal(): void {
        this.serviceBeingEditedId.set('');
        this.serviceFormName.set('');
        this.serviceFormPriceInReais.set(40);
        this.serviceFormDurationInMinutes.set(30);
        this.isServiceModalVisible.set(true);
    }

    protected openEditServiceModal(serviceId: string): void {
        const serviceCatalogItem = this.services().find(
            (currentServiceCatalogItem) => currentServiceCatalogItem.id === serviceId
        );
        if (!serviceCatalogItem) {
            return;
        }
        this.serviceBeingEditedId.set(serviceCatalogItem.id);
        this.serviceFormName.set(serviceCatalogItem.serviceName);
        this.serviceFormPriceInReais.set(serviceCatalogItem.priceInCents / 100);
        this.serviceFormDurationInMinutes.set(serviceCatalogItem.estimatedDurationInMinutes);
        this.isServiceModalVisible.set(true);
    }

    protected closeServiceModal(): void {
        this.isServiceModalVisible.set(false);
        this.serviceBeingEditedId.set('');
    }

    protected submitServiceForm(): void {
        const trimmedServiceName = this.serviceFormName().trim();
        if (!trimmedServiceName) {
            return;
        }

        const payload = {
            serviceName: trimmedServiceName,
            priceInCents: Math.round(this.serviceFormPriceInReais() * 100),
            estimatedDurationInMinutes: this.serviceFormDurationInMinutes(),
        };

        if (this.isServiceEditingMode()) {
            this.adminApiService
                .updateService(this.serviceBeingEditedId(), payload)
                .subscribe({
                    next: () => {
                        this.feedbackMessage.set('Servico atualizado com sucesso.');
                        this.closeServiceModal();
                        this.reloadData();
                    },
                    error: (error) => {
                        this.feedbackMessage.set(
                            error?.error?.userFriendlyMessage ??
                                'Falha ao atualizar servico.'
                        );
                    },
                });
            return;
        }

        this.adminApiService.createService(payload).subscribe({
            next: () => {
                this.feedbackMessage.set('Servico cadastrado com sucesso.');
                this.closeServiceModal();
                this.reloadData();
            },
            error: (error) => {
                this.feedbackMessage.set(
                    error?.error?.userFriendlyMessage ?? 'Falha ao cadastrar servico.'
                );
            },
        });
    }

    protected deleteService(): void {
        if (!this.isServiceEditingMode()) {
            return;
        }
        this.adminApiService.deleteService(this.serviceBeingEditedId()).subscribe({
            next: () => {
                this.feedbackMessage.set('Servico excluido com sucesso.');
                this.closeServiceModal();
                this.reloadData();
            },
            error: (error) => {
                this.feedbackMessage.set(
                    error?.error?.userFriendlyMessage ?? 'Falha ao excluir servico.'
                );
            },
        });
    }

    protected openCreateBarberModal(): void {
        this.barberBeingEditedId.set('');
        this.barberFormFullName.set('');
        this.barberFormWorkingStartTime.set('09:00');
        this.barberFormWorkingEndTime.set('19:00');
        this.barberFormLunchBreakStartTime.set('12:00');
        this.barberFormLunchBreakEndTime.set('13:00');
        this.barberFormSelectedServiceIds.set([]);
        this.isBarberModalVisible.set(true);
    }

    protected openEditBarberModal(barberId: string): void {
        const barber = this.barbers().find((currentBarber) => currentBarber.id === barberId);
        if (!barber) {
            return;
        }
        this.barberBeingEditedId.set(barber.id);
        this.barberFormFullName.set(barber.fullName);
        this.barberFormWorkingStartTime.set(barber.workingStartTime);
        this.barberFormWorkingEndTime.set(barber.workingEndTime);
        this.barberFormLunchBreakStartTime.set(barber.lunchBreakStartTime ?? '');
        this.barberFormLunchBreakEndTime.set(barber.lunchBreakEndTime ?? '');
        this.barberFormSelectedServiceIds.set([...barber.availableServices]);
        this.isBarberModalVisible.set(true);
    }

    protected closeBarberModal(): void {
        this.isBarberModalVisible.set(false);
        this.barberBeingEditedId.set('');
    }

    protected toggleBarberFormService(serviceId: string): void {
        const currentServiceIds = this.barberFormSelectedServiceIds();
        if (currentServiceIds.includes(serviceId)) {
            this.barberFormSelectedServiceIds.set(
                currentServiceIds.filter((currentServiceId) => currentServiceId !== serviceId)
            );
            return;
        }
        this.barberFormSelectedServiceIds.set([...currentServiceIds, serviceId]);
    }

    protected submitBarberForm(): void {
        const trimmedBarberFullName = this.barberFormFullName().trim();
        if (!trimmedBarberFullName || this.barberFormSelectedServiceIds().length === 0) {
            return;
        }

        const payload = {
            fullName: trimmedBarberFullName,
            workingDays: [1, 2, 3, 4, 5, 6],
            workingStartTime: this.barberFormWorkingStartTime(),
            workingEndTime: this.barberFormWorkingEndTime(),
            lunchBreakStartTime: this.barberFormLunchBreakStartTime() || undefined,
            lunchBreakEndTime: this.barberFormLunchBreakEndTime() || undefined,
            availableServices: this.barberFormSelectedServiceIds(),
        };

        if (this.isBarberEditingMode()) {
            this.adminApiService
                .updateBarber(this.barberBeingEditedId(), payload)
                .subscribe({
                    next: () => {
                        this.feedbackMessage.set('Profissional atualizado com sucesso.');
                        this.closeBarberModal();
                        this.reloadData();
                    },
                    error: (error) => {
                        this.feedbackMessage.set(
                            error?.error?.userFriendlyMessage ??
                                'Falha ao atualizar profissional.'
                        );
                    },
                });
            return;
        }

        this.adminApiService.createBarber(payload).subscribe({
            next: () => {
                this.feedbackMessage.set('Profissional cadastrado com sucesso.');
                this.closeBarberModal();
                this.reloadData();
            },
            error: (error) => {
                this.feedbackMessage.set(
                    error?.error?.userFriendlyMessage ??
                        'Falha ao cadastrar profissional.'
                );
            },
        });
    }

    protected deleteBarber(): void {
        if (!this.isBarberEditingMode()) {
            return;
        }
        this.adminApiService.deleteBarber(this.barberBeingEditedId()).subscribe({
            next: () => {
                this.feedbackMessage.set('Profissional excluido com sucesso.');
                this.closeBarberModal();
                this.reloadData();
            },
            error: (error) => {
                this.feedbackMessage.set(
                    error?.error?.userFriendlyMessage ??
                        'Falha ao excluir profissional.'
                );
            },
        });
    }

    protected openBusinessLocationModal(): void {
        const currentBusinessLocation = this.businessLocation();
        this.businessLocationFullAddress.set(currentBusinessLocation?.fullAddress ?? '');
        this.businessLocationMapQuery.set(currentBusinessLocation?.mapQuery ?? '');
        this.isBusinessLocationModalVisible.set(true);
        this.loadBusinessLocation();
    }

    protected closeBusinessLocationModal(): void {
        this.isBusinessLocationModalVisible.set(false);
    }

    protected saveBusinessLocation(): void {
        const trimmedFullAddress = this.businessLocationFullAddress().trim();
        const trimmedMapQuery = this.businessLocationMapQuery().trim();
        if (!trimmedFullAddress) {
            this.feedbackMessage.set('Informe o endereco completo da barbearia.');
            return;
        }

        this.adminApiService
            .updateBusinessLocationByAdmin({
                fullAddress: trimmedFullAddress,
                mapQuery: trimmedMapQuery || undefined,
            })
            .subscribe({
                next: (updatedBusinessLocation) => {
                    this.businessLocation.set(updatedBusinessLocation);
                    this.businessLocationFullAddress.set(updatedBusinessLocation.fullAddress);
                    this.businessLocationMapQuery.set(updatedBusinessLocation.mapQuery);
                    this.feedbackMessage.set('Endereco atualizado com sucesso.');
                    this.closeBusinessLocationModal();
                },
                error: (error) => {
                    this.feedbackMessage.set(
                        error?.error?.userFriendlyMessage ??
                            'Falha ao atualizar endereco da barbearia.'
                    );
                },
            });
    }

    protected openAgendaFilterModal(): void {
        this.isAgendaFilterModalVisible.set(true);
        this.loadFilteredAppointments();
    }

    protected closeAgendaFilterModal(): void {
        this.isAgendaFilterModalVisible.set(false);
    }

    protected loadFilteredAppointments(): void {
        this.adminApiService
            .listAppointmentsByDate(
                this.convertDateInputToIsoString(this.appointmentFilterDate()),
                this.appointmentFilterBarberId() || undefined
            )
            .subscribe({
                next: (appointments) => {
                    this.filteredAppointments.set(appointments);
                },
                error: (error) => {
                    this.feedbackMessage.set(
                        error?.error?.userFriendlyMessage ??
                            'Falha ao carregar os agendamentos filtrados.'
                    );
                },
            });
    }

    protected setAdminCancellationReasonForAppointment(
        appointmentId: string,
        cancellationReason: string
    ): void {
        this.adminCancellationReasonByAppointmentId.update(
            (currentCancellationReasonByAppointmentId) => ({
                ...currentCancellationReasonByAppointmentId,
                [appointmentId]: cancellationReason,
            })
        );
    }

    protected canCancelAppointmentByAdmin(appointmentId: string): boolean {
        const cancellationReason =
            this.adminCancellationReasonByAppointmentId()[appointmentId] ?? '';
        return cancellationReason.trim().length > 0;
    }

    protected cancelAppointmentByAdmin(appointmentId: string): void {
        const cancellationReason =
            this.adminCancellationReasonByAppointmentId()[appointmentId] ?? '';
        if (!cancellationReason.trim()) {
            return;
        }

        this.adminApiService
            .cancelAppointmentByAdmin(appointmentId, cancellationReason)
            .subscribe({
                next: () => {
                    this.feedbackMessage.set('Agendamento cancelado por admin.');
                    this.adminCancellationReasonByAppointmentId.update(
                        (currentCancellationReasonByAppointmentId) => ({
                            ...currentCancellationReasonByAppointmentId,
                            [appointmentId]: '',
                        })
                    );
                    this.loadFilteredAppointments();
                },
                error: (error) => {
                    this.feedbackMessage.set(
                        error?.error?.userFriendlyMessage ??
                            'Falha ao cancelar agendamento no painel admin.'
                    );
                },
            });
    }

    protected formatAppointmentStatus(appointment: AppointmentInterface): string {
        if (
            appointment.status === 'CANCELLED' &&
            appointment.cancellationActorType === 'ADMIN'
        ) {
            return 'CANCELLED - CANCELADO POR ADMIN';
        }
        return appointment.status;
    }

    protected logoutAdminAccess(): void {
        this.adminAccessStateService.clearAdminAccessKey();
        this.router.navigateByUrl('/admin-access');
    }

    protected formatPriceInReais(priceInCents: number): string {
        return (priceInCents / 100).toFixed(2).replace('.', ',');
    }

    protected formatDateTime(appointmentDateTimeIsoString: string): string {
        return new Date(appointmentDateTimeIsoString).toLocaleString('pt-BR');
    }

    private reloadData(): void {
        this.serviceCatalogApiService
            .listServices()
            .subscribe((serviceCatalogItems) => this.services.set(serviceCatalogItems));
        this.schedulingApiService
            .listBarbers()
            .subscribe((barberList) => this.barbers.set(barberList));
        this.loadBusinessLocation();
    }

    private loadBusinessLocation(): void {
        this.adminApiService.getBusinessLocationByAdmin().subscribe({
            next: (businessLocation) => {
                this.businessLocation.set(businessLocation);
                this.businessLocationFullAddress.set(businessLocation?.fullAddress ?? '');
                this.businessLocationMapQuery.set(businessLocation?.mapQuery ?? '');
            },
            error: () => {
                this.businessLocation.set(null);
            },
        });
    }

    private getCurrentDateIsoString(): string {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentDay = String(currentDate.getDate()).padStart(2, '0');
        return `${currentYear}-${currentMonth}-${currentDay}`;
    }

    private convertDateInputToIsoString(dateInputValue: string): string {
        if (!dateInputValue) {
            return new Date().toISOString();
        }
        return new Date(`${dateInputValue}T00:00:00`).toISOString();
    }
}
