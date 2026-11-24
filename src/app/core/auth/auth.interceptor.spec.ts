import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

const sesion = {
  token: 'tok',
  usuario: {
    id: 1,
    username: 'olmos',
    nombre: 'Olga',
    apellido: 'Olmos',
    rol: 'OPERADOR_MUNICIPAL',
    organizacionId: null,
    organizacionNombre: null
  }
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.setItem('rescuesync.sesion', JSON.stringify(sesion));
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([{ path: 'login', children: [] }])]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('agrega el token solo a pedidos de la API', () => {
    http.get(`${environment.apiUrl}/algo`).subscribe();
    expect(controller.expectOne(`${environment.apiUrl}/algo`).request.headers.get('Authorization')).toBe('Bearer tok');

    http.get('https://otro.sitio/dato').subscribe();
    expect(controller.expectOne('https://otro.sitio/dato').request.headers.has('Authorization')).toBe(false);
  });

  it('ante un 401 limpia la sesión', () => {
    http.get(`${environment.apiUrl}/algo`).subscribe({ error: () => undefined });
    controller.expectOne(`${environment.apiUrl}/algo`).flush({ error: 'vencida' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(false);
  });
});
