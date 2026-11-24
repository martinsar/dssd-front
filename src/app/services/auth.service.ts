import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, SesionActual } from '../models/auth.model';

const STORAGE_KEY = 'rescuesync_sesion';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _sesion = signal<LoginResponse | null>(this.leerSesionGuardada());

  readonly sesion = this._sesion.asReadonly();
  readonly usuario = computed(() => this._sesion()?.usuario ?? null);
  readonly estaAutenticado = computed(() => {
    const actual = this._sesion();
    if (!actual?.token) {
      return false;
    }
    return !this.estaExpirada(actual.expiraEn);
  });
  readonly esAuditor = computed(() => this.usuario()?.rol === 'AUDITOR');

  getToken(): string | null {
    const actual = this._sesion();
    if (!actual?.token || this.estaExpirada(actual.expiraEn)) {
      return null;
    }
    return actual.token;
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta) => {
        this._sesion.set(respuesta);
        this.guardarSesion(respuesta);
      }),
    );
  }

  verificarSesion(): Observable<SesionActual | null> {
    if (!this.getToken()) {
      return of(null);
    }
    return this.http.get<SesionActual>(`${this.apiUrl}/sesion`).pipe(
      tap((actual) => {
        const previa = this._sesion();
        if (previa) {
          const actualizada: LoginResponse = {
            ...previa,
            expiraEn: actual.expiraEn,
            usuario: actual.usuario,
          };
          this._sesion.set(actualizada);
          this.guardarSesion(actualizada);
        }
      }),
      catchError(() => {
        this.limpiarSesion();
        return of(null);
      }),
    );
  }

  logout(): Observable<void> {
    const tieneToken = Boolean(this.getToken());
    if (!tieneToken) {
      this.limpiarSesion();
      return of(undefined);
    }
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(undefined)),
      tap(() => this.limpiarSesion()),
    );
  }

  limpiarSesion(): void {
    this._sesion.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora entornos sin localStorage disponible
    }
  }

  private guardarSesion(sesion: LoginResponse): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
    } catch {
      // Ignora entornos sin localStorage disponible
    }
  }

  private leerSesionGuardada(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as LoginResponse;
      if (!parsed?.token || this.estaExpirada(parsed.expiraEn)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private estaExpirada(expiraEn?: string | null): boolean {
    if (!expiraEn) {
      return false;
    }
    const timestamp = Date.parse(expiraEn);
    if (Number.isNaN(timestamp)) {
      return false;
    }
    return timestamp <= Date.now();
  }
}
