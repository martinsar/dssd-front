// [Entrega final] Sesión del usuario (una por pestaña, en sessionStorage)
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Rol, SesionResponse, UsuarioSesion } from '../../models/sesion.model';
import { PREFIJO_ROL } from './roles';

const CLAVE = 'rescuesync.sesion';

interface SesionGuardada {
  token: string;
  usuario: UsuarioSesion;
}

// Se lee la sesión guardada (si el contenido no sirve, se ignora)
function leerDeStorage(): SesionGuardada | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) {
      return null;
    }
    const valor = JSON.parse(crudo) as SesionGuardada;
    return valor && valor.token && valor.usuario ? valor : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private sesion = signal<SesionGuardada | null>(leerDeStorage());
  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly token = computed(() => this.sesion()?.token ?? null);
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly rol = computed(() => this.usuario()?.rol ?? null);

  // Se inicia sesión con el usuario y la contraseña del proceso
  login(username: string, password: string): Observable<UsuarioSesion> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, { username, password }).pipe(
      tap(r => this.guardar({ token: r.token, usuario: r.usuario })),
      map(r => r.usuario)
    );
  }

  // Se confirma que la sesión guardada siga vigente (si venció, se descarta sin navegar)
  async verificarSesionInicial(): Promise<void> {
    const actual = this.sesion();
    if (!actual) {
      return;
    }
    try {
      const r = await firstValueFrom(this.http.get<SesionResponse>(`${this.api}/auth/sesion`));
      this.guardar({ token: actual.token, usuario: r.usuario });
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.vaciar();
      }
    }
  }

  // Se cierra la sesión en el servidor (sin importar el resultado) y se vuelve al login
  logout(): void {
    const token = this.token();
    if (token) {
      this.http
        .post(`${this.api}/auth/logout`, null, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
        .subscribe({ error: () => undefined });
    }
    this.vaciar();
    void this.router.navigate(['/login']);
  }

  // Se descarta la sesión; si venció se avisa en el login
  limpiarSesion(expirada: boolean): void {
    const habia = this.sesion() !== null;
    this.vaciar();
    if (expirada && !habia) {
      return;
    }
    void this.router.navigate(['/login'], expirada ? { queryParams: { motivo: 'expirada' } } : {});
  }

  // Se devuelve la pantalla de inicio de cada perfil
  rutaInicio(rol: Rol | null = this.rol()): string {
    return rol ? `/${PREFIJO_ROL[rol]}` : '/login';
  }

  private guardar(valor: SesionGuardada): void {
    this.sesion.set(valor);
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(valor));
    } catch {
      // Sin almacenamiento disponible, la sesión dura mientras la pestaña siga abierta
    }
  }

  private vaciar(): void {
    this.sesion.set(null);
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // Sin almacenamiento disponible no hay nada que borrar
    }
  }
}
