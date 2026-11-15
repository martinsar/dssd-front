import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

function iniciarSesion(rol: string): void {
  sessionStorage.setItem(
    'rescuesync.sesion',
    JSON.stringify({
      token: 't',
      usuario: { id: 1, username: 'u', nombre: 'Rosa', apellido: 'Rep', rol, organizacionId: 1, organizacionNombre: 'Cáritas' }
    })
  );
}

async function renderizar(rol: string): Promise<HTMLElement> {
  iniciarSesion(rol);
  await TestBed.configureTestingModule({
    imports: [Shell],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
  }).compileComponents();
  const fixture = TestBed.createComponent(Shell);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Shell', () => {
  afterEach(() => sessionStorage.clear());

  it('muestra la marca', async () => {
    const el = await renderizar('COORDINADOR');
    expect(el.querySelector('.navbar-brand')?.textContent).toContain('RescueSync');
  });

  it('el menú corresponde al rol', async () => {
    const el = await renderizar('COORDINADOR');
    const texto = el.querySelector('.navbar-links')?.textContent ?? '';
    expect(texto).toContain('Monitoreo');
    expect(texto).toContain('Convocatorias');
    expect(texto).not.toContain('Inventario');
  });

  it('la ONG ve su organización', async () => {
    const el = await renderizar('ONG');
    const menu = el.querySelector('.navbar-links')?.textContent ?? '';
    for (const item of ['Convocatorias', 'Mis ofertas', 'Ofertas conjuntas', 'Notificaciones', 'Inventario']) {
      expect(menu).toContain(item);
    }
    expect(el.querySelector('.navbar-user')?.textContent).toContain('Cáritas');
  });
});
