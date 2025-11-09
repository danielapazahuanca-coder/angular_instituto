// periodo-academico.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  anio: number;
  tipo: string; 
  fecha_inicio: string;
  fecha_fin: string;
  fecha_inicio_inscripciones: string | null;
  fecha_fin_inscripciones: string | null;
  estado: string;
  created_at: string;
}

export interface CrearPeriodoAcademicoDTO {
  nombre: string;
  anio: number;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_inicio_inscripciones?: string;
  fecha_fin_inscripciones?: string;
}

export interface ActualizarPeriodoAcademicoDTO {
  nombre?: string;
  anio?: number;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_inicio_inscripciones?: string;
  fecha_fin_inscripciones?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: PeriodoAcademico | PeriodoAcademico[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoAcademicoService {
  private apiUrl = `${environment.apiUrl}/periodos_academicos`;

  constructor(private http: HttpClient) {}

  getPeriodos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getPeriodoById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearPeriodo(periodo: CrearPeriodoAcademicoDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, periodo);
  }

  actualizarPeriodo(id: number, periodo: ActualizarPeriodoAcademicoDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, periodo);
  }

  eliminarPeriodo(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}