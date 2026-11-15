import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const usuario = {
  id: 1,
  username: 'olmos',
  nombre: 'Olga',
  apellido: 'Olmos',
  rol: 'OPERADOR_MUNICIPAL' as const,
  organizacionId: null,
  organizacionNombre: null
};

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', children: [] }])]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('el login guarda la sesión en sessionStorage', () => {
    auth.login('olmos', 'x').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: 'abc', expiraEn: '2026-11-06T18:00:00', usuario });
    expect(auth.autenticado()).toBe(true);
    expect(auth.rol()).toBe('OPERADOR_MUNICIPAL');
    expect(auth.rutaInicio()).toBe('/municipio');
    expect(sessionStorage.getItem('rescuesync.sesion')).toContain('abc');
  });

  it('el logout limpia la sesión', () => {
    auth.login('olmos', 'x').subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: 'abc', expiraEn: '2026-11-06T18:00:00', usuario });
    auth.logout();
    http.expectOne(`${environment.apiUrl}/auth/logout`).flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem('rescuesync.sesion')).toBeNull();
  });
});
