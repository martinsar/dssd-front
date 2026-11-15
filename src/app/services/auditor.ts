// [Entrega final] Servicio del Auditor
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditoriaEmergencia, Indicadores } from '../models/indicadores.model';

@Injectable({ providedIn: 'root' })
export class AuditorService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auditor`;

  indicadores(desde?: string, hasta?: string): Observable<Indicadores> {
    return this.http.get<Indicadores>(`${this.api}/indicadores`, { params: this.periodo(desde, hasta) });
  }

  emergencias(desde?: string, hasta?: string): Observable<AuditoriaEmergencia[]> {
    return this.http.get<AuditoriaEmergencia[]>(`${this.api}/emergencias`, { params: this.periodo(desde, hasta) });
  }

  private periodo(desde?: string, hasta?: string): HttpParams {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return params;
  }
}
