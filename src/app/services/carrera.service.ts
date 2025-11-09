// carrera.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Carrera {
  id: number;
  modalidad_id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  duracion_semestres: number;
  creditos_totales: number | null;
  requisitos: string | null;
  perfil_egreso: string | null;
  campo_laboral: string | null;
  costo_inscripcion: number | null;
  costo_mensual: number | null;
  estado: string;
  created_at: string;
}

export interface CrearCarreraDTO {
  modalidad_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracion_semestres: number;
  creditos_totales?: number;
  requisitos?: string;
  perfil_egreso?: string;
  campo_laboral?: string;
  costo_inscripcion?: number;
  costo_mensual?: number;
}

export interface ActualizarCarreraDTO {
  modalidad_id?: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  duracion_semestres?: number;
  creditos_totales?: number;
  requisitos?: string;
  perfil_egreso?: string;
  campo_laboral?: string;
  costo_inscripcion?: number;
  costo_mensual?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Carrera | Carrera[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class CarreraService {
  private apiUrl = `${environment.apiUrl}/carreras`;

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getCarreraById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearCarrera(carrera: CrearCarreraDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, carrera);
  }

  actualizarCarrera(id: number, carrera: ActualizarCarreraDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, carrera);
  }

  eliminarCarrera(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}