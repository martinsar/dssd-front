// [Entrega final] Servicio de notificaciones de la ONG
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/ong/notificaciones`;

  // Cantidad de notificaciones sin leer que muestra el menú
  readonly noLeidas = signal(0);

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.api);
  }

  // Se actualiza el contador (si falla, se deja el valor anterior)
  refrescarNoLeidas(): void {
    this.http.get<{ cantidad: number }>(`${this.api}/no-leidas`).subscribe({
      next: r => this.noLeidas.set(r.cantidad),
      error: () => undefined
    });
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/lectura`, null);
  }

  marcarTodas(): Observable<void> {
    return this.http.post<void>(`${this.api}/lectura`, null);
  }
}
