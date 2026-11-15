import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // [Entrega final] Se agrega el token a cada pedido
    provideHttpClient(withInterceptors([authInterceptor])),
    // [Entrega final] Se verifica la sesión guardada antes de navegar
    provideAppInitializer(() => inject(AuthService).verificarSesionInicial())
  ],
};
