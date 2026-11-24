// [Entrega final] Servicio del Operador Municipal
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmergenciaDetalle, EmergenciaResumen } from '../models/emergencia.model';
import { AdjudicacionResponse, OfertaValidada } from '../models/oferta.model';

@Injectable({ providedIn: 'root' })
export class MunicipioService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/municipio`;

  misEmergencias(): Observable<EmergenciaResumen[]> {
    return this.http.get<EmergenciaResumen[]>(`${this.api}/emergencias`);
  }

  detalle(id: number): Observable<EmergenciaDetalle> {
    return this.http.get<EmergenciaDetalle>(`${this.api}/emergencias/${id}`);
  }

  ofertasValidadas(id: number): Observable<OfertaValidada[]> {
    return this.http.get<OfertaValidada[]>(`${this.api}/emergencias/${id}/ofertas-validadas`);
  }

  adjudicar(id: number, ofertaIds: number[]): Observable<AdjudicacionResponse> {
    return this.http.post<AdjudicacionResponse>(`${this.api}/emergencias/${id}/adjudicacion`, { ofertaIds });
  }
}
