// [Entrega final] Se agrega el token a cada pedido y se maneja la sesión vencida
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const SIN_LIMPIEZA = ['/auth/login', '/auth/logout', '/auth/sesion'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const esApi = req.url.startsWith(environment.apiUrl);

  const pedido =
    esApi && token && !req.headers.has('Authorization')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(pedido).pipe(
    catchError((err: unknown) => {
      if (
        esApi &&
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !SIN_LIMPIEZA.some(sufijo => req.url.endsWith(sufijo))
      ) {
        auth.limpiarSesion(true);
      }
      return throwError(() => err);
    })
  );
};
