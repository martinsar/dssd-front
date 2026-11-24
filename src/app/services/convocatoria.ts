// [Entrega 2 · Tarea 4] ARCHIVO NUEVO.
// Servicio que usa la pantalla del coordinador (gestion-convocatoria) para hablar con el backend.
// Cubre los dos pasos de la convocatoria:
//   - Relevamiento  -> tarea "Desglosar Lotes" en Bonita (la completa el backend)
//   - Publicación   -> tarea "Gestionar Convocatoria" en Bonita (la completa el backend)
// Angular nunca llama a Bonita: solo a los endpoints /api del backend.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Un lote tal como lo espera el backend (record NecesidadRequest).
// El tipo de recurso viaja como id plano (tipoRecursoId), no como objeto anidado.
export interface LoteRequest {
  tipoRecursoId: number;
  cantidad: number;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class ConvocatoriaService {
  // inject() es la forma moderna de pedir una dependencia (equivale a recibirla por el constructor)
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Paso 1: emergencias que todavía no tienen una convocatoria publicada
  emergenciasPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/emergencias/pendientes`);
  }

  // Para saber si la emergencia ya tiene una convocatoria en BORRADOR (y saltar directo a publicar)
  convocatoriasDeEmergencia(emergenciaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/emergencias/${emergenciaId}/convocatorias`);
  }

  // Opciones del combo "Tipo de recurso" de cada lote
  tiposRecurso(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/tipos-recurso`);
  }

  // Paso 2 (relevamiento): crea la convocatoria con TODOS sus lotes en un solo pedido.
  // El backend guarda todo y completa "Desglosar Lotes" en Bonita.
  crearRelevamiento(emergenciaId: number, lotes: LoteRequest[]): Observable<any> {
    return this.http.post<any>(`${this.api}/emergencias/${emergenciaId}/convocatorias`, { necesidades: lotes });
  }

  // Lotes ya relevados de una convocatoria (se muestran en el paso de publicación)
  lotesDeConvocatoria(convocatoriaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/convocatorias/${convocatoriaId}/necesidades`);
  }

  // Paso 3 (publicación formal): define la ventana de tiempo y publica.
  // El backend completa "Gestionar Convocatoria" enviando idConvocatoria y fechaCierre por el contrato.
  // Fechas en formato ISO sin zona horaria: "2026-10-10T18:00:00". fechaApertura puede ser null (= ahora).
  publicar(convocatoriaId: number, fechaApertura: string | null, fechaCierre: string): Observable<any> {
    return this.http.post<any>(`${this.api}/convocatorias/${convocatoriaId}/publicar`, { fechaApertura, fechaCierre });
  }
}
