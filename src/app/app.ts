import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationSnackbarComponent } from './shared/components/application-snackbar.component';
import { ApplicationLoadingOverlayComponent } from './shared/components/application-loading-overlay.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ApplicationSnackbarComponent, ApplicationLoadingOverlayComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {}
