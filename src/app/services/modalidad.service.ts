// modalidad.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Modalidad {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracion_meses: number | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface CrearModalidadDTO {
  nombre: string;
  descripcion?: string;
  duracion_meses?: number;
}

export interface ActualizarModalidadDTO {
  nombre?: string;
  descripcion?: string;
  duracion_meses?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Modalidad | Modalidad[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModalidadService {
  private apiUrl = `${environment.apiUrl}/modalidad`;

  constructor(private http: HttpClient) {}

  getModalidades(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getModalidadById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearModalidad(modalidad: CrearModalidadDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, modalidad);
  }

  actualizarModalidad(id: number, modalidad: ActualizarModalidadDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, modalidad);
  }

  eliminarModalidad(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}