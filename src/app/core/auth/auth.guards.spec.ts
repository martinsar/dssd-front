import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { autenticadoGuard, invitadoGuard, rolGuard } from './auth.guards';

function guardarSesion(rol: string): void {
  sessionStorage.setItem(
    'rescuesync.sesion',
    JSON.stringify({
      token: 't',
      usuario: { id: 1, username: 'u', nombre: 'N', apellido: 'A', rol, organizacionId: null, organizacionNombre: null }
    })
  );
}

function ejecutar(guard: ReturnType<typeof rolGuard>, url = '/ong'): unknown {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
  );
}

describe('guards', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
  });

  afterEach(() => sessionStorage.clear());

  it('sin sesión redirige al login', () => {
    const resultado = ejecutar(autenticadoGuard, '/ong');
    expect(resultado instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toContain('/login');
  });

  it('con sesión permite el acceso y bloquea el login', () => {
    guardarSesion('ONG');
    expect(ejecutar(autenticadoGuard)).toBe(true);
    const resultado = ejecutar(invitadoGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/ong');
  });

  it('el guard de rol redirige al inicio del usuario', () => {
    guardarSesion('ONG');
    expect(ejecutar(rolGuard('ONG'))).toBe(true);
    const resultado = ejecutar(rolGuard('AUDITOR')) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/ong');
  });
});
