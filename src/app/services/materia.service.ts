// materia.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  creditos: number;
  horas_teoricas: number;
  horas_practicas: number;
  tipo: string; // 'obligatoria' | 'optativa' | etc.
  estado: string;
  created_at: string;
}

export interface CrearMateriaDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  tipo?: string;
}

export interface ActualizarMateriaDTO {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  creditos?: number;
  horas_teoricas?: number;
  horas_practicas?: number;
  tipo?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Materia | Materia[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  private apiUrl = `${environment.apiUrl}/materias`;

  constructor(private http: HttpClient) {}

  getMaterias(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getMateriaById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearMateria(materia: CrearMateriaDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, materia);
  }

  actualizarMateria(id: number, materia: ActualizarMateriaDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, materia);
  }

  eliminarMateria(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}