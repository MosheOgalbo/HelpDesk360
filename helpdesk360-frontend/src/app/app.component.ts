import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
  ],
  template: `
    <!-- Header משופר -->
    <mat-toolbar color="primary" class="main-toolbar shadow-lg">
      <div class="toolbar-content max-w-7xl mx-auto w-full flex items-center justify-between px-4">

        <!-- Logo ושם האפליקציה -->
        <div class="flex items-center">
          <mat-icon class="text-3xl ml-3 logo-icon">support_agent</mat-icon>
          <div class="flex flex-col">
            <span class="text-xl font-bold">מערכת פניות לקוחות</span>
            <span class="text-xs opacity-75 hidden md:block">HelpDesk360</span>
          </div>
        </div>

        <!-- ניווט עיקרי -->
        <nav class="flex items-center gap-2">
          <a
            mat-button
            routerLink="/contact"
            routerLinkActive="active-nav"
            class="nav-button text-white">
            <mat-icon class="text-xl">create</mat-icon>
            <span class="nav-text mr-2">טופס פנייה</span>
          </a>

          <a
            mat-button
            routerLink="/report"
            routerLinkActive="active-nav"
            class="nav-button text-white">
            <mat-icon class="text-xl">analytics</mat-icon>
            <span class="nav-text mr-2">דוח חודשי</span>
          </a>
        </nav>

      </div>
    </mat-toolbar>

    <!-- Main Content -->
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center mb-4 md:mb-0">
            <mat-icon class="ml-2 text-gray-400">copyright</mat-icon>
            <span class="text-gray-600">2025 מערכת פניות לקוחות - כל הזכויות שמורות</span>
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <mat-icon class="ml-1 text-sm">code</mat-icon>
            <span>נבנה עם Angular 19 & Material Design</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* Toolbar עיצוב משופר */
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      min-height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }

    .toolbar-content {
      height: 100%;
    }

    .logo-icon {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* Navigation buttons */
    .nav-button {
      border-radius: 8px !important;
      padding: 0.5rem 1rem !important;
      margin: 0 0.25rem !important;
      transition: all 0.3s ease !important;
      font-weight: 500 !important;
    }

    .nav-button:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-2px);
    }

    .active-nav {
      background-color: rgba(255, 255, 255, 0.25) !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .nav-button mat-icon {
      margin-left: 0.5rem;
    }

    /* Main content */
    .main-content {
      min-height: calc(100vh - 140px);
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      padding-top: 0;
    }

    /* Footer */
    .app-footer {
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
      color: white;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .main-toolbar {
        min-height: 60px;
      }

      .toolbar-content {
        padding: 0 1rem;
      }

      .nav-text {
        display: none;
      }

      .nav-button {
        min-width: 48px;
        padding: 0.5rem !important;
      }

      .nav-button mat-icon {
        margin: 0;
      }

      .text-xl {
        font-size: 1.125rem;
      }

      .text-xs {
        display: none;
      }

      .app-footer .flex-row {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
    }

    /* Enhanced shadow */
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }

    /* Accessibility improvements */
    .nav-button:focus {
      outline: 2px solid rgba(255, 255, 255, 0.8);
      outline-offset: 2px;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .main-content {
        background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
      }
    }

    /* Animation delays for smooth loading */
    .nav-button:nth-child(1) { animation-delay: 0.1s; }
    .nav-button:nth-child(2) { animation-delay: 0.2s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AppComponent {
  title = 'HelpDesk360 - מערכת פניות לקוחות';
}
