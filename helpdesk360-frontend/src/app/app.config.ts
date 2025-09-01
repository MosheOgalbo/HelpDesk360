import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routing
    provideRouter(routes),

    // HTTP Client - לקריאות API
    provideHttpClient(),

    // Animations - חובה ל-Material
    provideAnimationsAsync(),

    // Material Snackbar - להודעות
    importProvidersFrom(MatSnackBarModule)
  ]
};
