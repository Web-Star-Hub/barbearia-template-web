import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { BottomNavigationComponent } from '../../shared/components/bottom-navigation.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, PageHeaderComponent, BottomNavigationComponent],
    template: `
        <div class="layout-shell">
            <app-page-header />
            <main class="layout-content">
                <router-outlet />
            </main>
            <app-bottom-navigation />
        </div>
    `,
    styles: `
        .layout-shell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: var(--color-background);
        }

        .layout-content {
            flex: 1;
            padding: 16px 16px 86px 16px;
            max-width: 760px;
            width: 100%;
            margin: 0 auto;
        }
    `,
})
export class MainLayoutComponent {}
