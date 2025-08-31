import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <mat-toolbar color="primary" class="shadow-md">
        <span class="text-xl font-bold">HelpDesk360</span>

        <div class="flex-1"></div>

        <nav class="flex gap-2">
          <a mat-button routerLink="/requests" routerLinkActive="active-link" class="text-white">
            <mat-icon>support_agent</mat-icon>
            בקשות
          </a>
          <a mat-button routerLink="/reports" routerLinkActive="active-link" class="text-white">
            <mat-icon>analytics</mat-icon>
            דוחות
          </a>
        </nav>
      </mat-toolbar>

      <main class="container mx-auto p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .active-link {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  `]
})
export class AppComponent {
  title = 'helpdesk360-frontend';
}
