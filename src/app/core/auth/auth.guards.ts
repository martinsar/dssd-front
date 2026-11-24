// [Entrega final] Guardas de ruta por sesión y por rol
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../../models/sesion.model';
import { AuthService } from './auth.service';

// Sin sesión se redirige al login recordando la ruta pedida
export const autenticadoGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.autenticado()) {
    return true;
  }
  return router.createUrlTree(['/login'], state.url && state.url !== '/' ? { queryParams: { volver: state.url } } : {});
};

// Con sesión iniciada no se vuelve a mostrar el login
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.autenticado() ? router.parseUrl(auth.rutaInicio()) : true;
};

// Si el rol no corresponde se redirige al inicio del usuario
export function rolGuard(...roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.rol();
    return rol && roles.includes(rol) ? true : router.parseUrl(auth.rutaInicio());
  };
}
