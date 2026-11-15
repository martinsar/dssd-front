// [Entrega final] Servicio del Representante de ONG
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConvocatoriaAbierta } from '../models/convocatoria.model';
import { InventarioItem, InventarioRequest } from '../models/inventario.model';
import { TipoRecurso } from '../models/necesidad.model';
import {
  EspecialidadOng,
  OfertaConjuntaOng,
  OfertaConjuntaRequest,
  OfertaEdicionRequest,
  OfertaOng,
  OfertaRequest,
  OfertaVersion,
  OrganizacionResumen
} from '../models/oferta.model';

@Injectable({ providedIn: 'root' })
export class OngService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/ong`;

  convocatorias(): Observable<ConvocatoriaAbierta[]> {
    return this.http.get<ConvocatoriaAbierta[]>(`${this.api}/convocatorias`);
  }

  especialidades(): Observable<EspecialidadOng[]> {
    return this.http.get<EspecialidadOng[]>(`${this.api}/especialidades`);
  }

  organizaciones(): Observable<OrganizacionResumen[]> {
    return this.http.get<OrganizacionResumen[]>(`${this.api}/organizaciones`);
  }

  ofertas(): Observable<OfertaOng[]> {
    return this.http.get<OfertaOng[]>(`${this.api}/ofertas`);
  }

  oferta(id: number): Observable<OfertaOng> {
    return this.http.get<OfertaOng>(`${this.api}/ofertas/${id}`);
  }

  crearOferta(req: OfertaRequest): Observable<OfertaOng> {
    return this.http.post<OfertaOng>(`${this.api}/ofertas`, req);
  }

  editarOferta(id: number, req: OfertaEdicionRequest): Observable<OfertaOng> {
    return this.http.put<OfertaOng>(`${this.api}/ofertas/${id}`, req);
  }

  retirar(id: number): Observable<OfertaOng> {
    return this.http.post<OfertaOng>(`${this.api}/ofertas/${id}/retiro`, null);
  }

  versiones(id: number): Observable<OfertaVersion[]> {
    return this.http.get<OfertaVersion[]>(`${this.api}/ofertas/${id}/versiones`);
  }

  finalizar(id: number, informe: string): Observable<OfertaOng> {
    return this.http.post<OfertaOng>(`${this.api}/ofertas/${id}/finalizacion`, { informe: informe || null });
  }

  crearOfertaConjunta(req: OfertaConjuntaRequest): Observable<OfertaConjuntaOng> {
    return this.http.post<OfertaConjuntaOng>(`${this.api}/ofertas-conjuntas`, req);
  }

  ofertasConjuntas(): Observable<OfertaConjuntaOng[]> {
    return this.http.get<OfertaConjuntaOng[]>(`${this.api}/ofertas-conjuntas`);
  }

  ofertaConjunta(id: number): Observable<OfertaConjuntaOng> {
    return this.http.get<OfertaConjuntaOng>(`${this.api}/ofertas-conjuntas/${id}`);
  }

  inventario(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.api}/inventario`);
  }

  guardarInventario(tipoRecursoId: number, req: InventarioRequest): Observable<InventarioItem> {
    return this.http.put<InventarioItem>(`${this.api}/inventario/${tipoRecursoId}`, req);
  }

  quitarInventario(tipoRecursoId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/inventario/${tipoRecursoId}`);
  }

  tiposRecurso(): Observable<TipoRecurso[]> {
    return this.http.get<TipoRecurso[]>(`${environment.apiUrl}/tipos-recurso`);
  }
}
