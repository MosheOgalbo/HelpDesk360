
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo and Title -->
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">HelpDesk360</h1>
                <p class="text-sm text-gray-500">Enterprise Support Management</p>
              </div>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex space-x-8">
              <a routerLink="/requests"
                 routerLinkActive="text-primary-600 border-primary-600"
                 class="border-b-2 border-transparent hover:text-primary-600 hover:border-primary-600 px-1 py-2 text-sm font-medium text-gray-700 transition-colors">
                Requests
              </a>
              <a routerLink="/reports"
                 routerLinkActive="text-primary-600 border-primary-600"
                 class="border-b-2 border-transparent hover:text-primary-600 hover:border-primary-600 px-1 py-2 text-sm font-medium text-gray-700 transition-colors">
                Reports
              </a>
            </nav>

            <!-- Mobile Menu Button -->
            <div class="md:hidden">
              <button (click)="toggleMobileMenu()"
                      class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        [attr.d]="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'">
                  </path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Menu -->
          <div [class.hidden]="!mobileMenuOpen" class="md:hidden border-t border-gray-200 py-4">
            <nav class="space-y-2">
              <a routerLink="/requests"
                 routerLinkActive="bg-primary-50 text-primary-600"
                 class="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                 (click)="mobileMenuOpen = false">
                Requests
              </a>
              <a routerLink="/reports"
                 routerLinkActive="bg-primary-50 text-primary-600"
                 class="block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                 (click)="mobileMenuOpen = false">
                Reports
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-500">
              © 2024 HelpDesk360. All rights reserved.
            </p>
            <p class="text-xs text-gray-400">
              Version 1.0.0 | Built with Angular & TailwindCSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
