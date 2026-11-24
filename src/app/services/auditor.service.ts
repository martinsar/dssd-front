import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IndicadoresDto } from '../models/indicadores.model';

@Injectable({
  providedIn: 'root',
})
export class AuditorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auditor`;

  getIndicadores(desde?: string | null, hasta?: string | null): Observable<IndicadoresDto> {
    let params = new HttpParams();
    if (desde && desde.trim()) {
      params = params.set('desde', desde.trim());
    }
    if (hasta && hasta.trim()) {
      params = params.set('hasta', hasta.trim());
    }
    return this.http.get<IndicadoresDto>(`${this.apiUrl}/indicadores`, { params });
  }
}
