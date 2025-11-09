// grupo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Grupo {
  id: number;
  codigo: string;
  materia_id: number;
  periodo_academico_id: number;
  profesor_id: number | null;
  cupo_maximo: number;
  aula: string | null;
  horario: string | null;
  estado: string;
  created_at: string;

  // Campos adicionales del JOIN (solo en getAll)
  materia?: string;
  profesor?: string;
  periodo?: string;
}

export interface CrearGrupoDTO {
  codigo: string;
  materia_id: number;
  periodo_academico_id: number;
  profesor_id?: number;
  cupo_maximo: number;
  aula?: string;
  horario?: string;
}

export interface ActualizarGrupoDTO {
  codigo?: string;
  materia_id?: number;
  periodo_academico_id?: number;
  profesor_id?: number;
  cupo_maximo?: number;
  aula?: string;
  horario?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Grupo | Grupo[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  getGrupos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getGrupoById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearGrupo(grupo: CrearGrupoDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, grupo);
  }

  actualizarGrupo(id: number, grupo: ActualizarGrupoDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, grupo);
  }

  eliminarGrupo(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}