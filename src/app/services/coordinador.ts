// [Entrega final] Servicio del Centro Coordinador
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EtapaEmergencia } from '../models/emergencia.model';
import { MonitoreoFila, SeguimientoEmergencia } from '../models/monitoreo.model';
import { ConvocatoriaResumen, DecisionConvocatoriaRequest } from '../models/convocatoria.model';

@Injectable({ providedIn: 'root' })
export class CoordinadorService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/coordinador`;

  monitoreo(etapa?: EtapaEmergencia | ''): Observable<MonitoreoFila[]> {
    const params = etapa ? new HttpParams().set('etapa', etapa) : new HttpParams();
    return this.http.get<MonitoreoFila[]>(`${this.api}/monitoreo`, { params });
  }

  seguimiento(id: number): Observable<SeguimientoEmergencia> {
    return this.http.get<SeguimientoEmergencia>(`${this.api}/emergencias/${id}`);
  }

  decidir(convocatoriaId: number, req: DecisionConvocatoriaRequest): Observable<ConvocatoriaResumen> {
    return this.http.post<ConvocatoriaResumen>(`${this.api}/convocatorias/${convocatoriaId}/decision`, req);
  }
}
