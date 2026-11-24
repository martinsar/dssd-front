import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const esBackend = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url.endsWith('/auth/login');

  if (!esBackend || esLogin || req.headers.has('Authorization')) {
    return next(req);
  }

  const token = authService.getToken();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
