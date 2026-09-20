import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Necesidad {
  private apiUrl = `${environment.apiUrl}/necesidades`;

  constructor(private http: HttpClient) { }

  crearNecesidad(necesidad: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, necesidad);
  }

  getConvocatorias(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/convocatorias`);
  }

  getTiposRecurso(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/tipos-recurso`);
  }
}