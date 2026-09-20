import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Emergencia } from '../models/emergencia.model';
import { environment } from '../../environments/environment'; // Importa el environment

@Injectable({
  providedIn: 'root'
})
export class EmergenciaService {
  // Construye la URL base + el endpoint específico
  private apiUrl = `${environment.apiUrl}/emergencias`;

  constructor(private http: HttpClient) { }

  crearEmergencia(emergencia: Emergencia): Observable<Emergencia> {
    return this.http.post<Emergencia>(this.apiUrl, emergencia);
  }

  getTiposEmergencia(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/tipos-emergencia`);
  }
}