// curso.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HorarioDTO {
  id?: number; 
  turno: string;
  hora_inicio: string;    
  hora_fin: string;       
  dias_semana: string;    
}

export interface Curso {
  id: number;
  nombre: string;
  duracion_meses: number;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  precio_total: number;
  precio_mensual: number;
  descripcion: string | null;
  tipo?: number;
  activo: boolean;
  fecha_creacion: string;      
  fecha_actualizacion: string;
  horarios?: HorarioDTO[];
}

export interface CrearCursoDTO {
  nombre: string;
  duracion_meses: number;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  precio_total: number;
  precio_mensual: number;
  descripcion?: string;
  tipo?: number;
  activo?: boolean;
  horarios?: HorarioDTO[]; 
}

export interface ActualizarCursoDTO {
  nombre?: string;
  duracion_meses?: number;
  modalidad?: 'presencial' | 'virtual' | 'hibrido';
  precio_total?: number;
  precio_mensual?: number;
  descripcion?: string;
  activo?: boolean;
  horarios: HorarioDTO[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Curso | Curso[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCursos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getCursoById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearCurso(curso: CrearCursoDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, curso);
  }

  actualizarCurso(id: number, curso: ActualizarCursoDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, curso);
  }

  eliminarCurso(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}