// estudiante.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  observaciones: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CrearEstudianteDTO {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface ActualizarEstudianteDTO {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  ci?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Estudiante | Estudiante[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = `${environment.apiUrl}/estudiantes`;

  constructor(private http: HttpClient) {}

  getEstudiantes(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getEstudianteById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearEstudiante(estudiante: CrearEstudianteDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, estudiante);
  }

  actualizarEstudiante(id: number, estudiante: ActualizarEstudianteDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, estudiante);
  }

  eliminarEstudiante(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}