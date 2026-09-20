import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Oferta {
  private apiUrl = `${environment.apiUrl}/ofertas`;

  constructor(private http: HttpClient) { }

  crearOferta(oferta: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, oferta);
  }

  getTiposRecurso(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/tipos-recurso`);
  }

  getOrganizaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/organizaciones`);
  }

  getConvocatorias(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/convocatorias`);
  }
}