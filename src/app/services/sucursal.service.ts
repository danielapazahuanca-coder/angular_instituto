// sucursal.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  ciudad: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface CrearSucursalDTO {
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad: string;
  activo?: boolean;
}

export interface ActualizarSucursalDTO {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  activo?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
   data: Sucursal | Sucursal[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private apiUrl = `${environment.apiUrl}/sucursales`;

  constructor(private http: HttpClient) {}

  // 🔹 GET: Listar todas las sucursales activas
  getSucursales(): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(this.apiUrl);
  }

  // 🔹 GET: Obtener sucursal por ID
  getSucursalById(id: number): Observable<ApiResponse<Sucursal>> {
    return this.http.get<ApiResponse<Sucursal>>(`${this.apiUrl}/${id}`);
  }

  // 🔹 GET: Filtrar sucursales por ciudad
  getByCiudad(ciudad: string): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(
      `${this.apiUrl}/ciudad/${encodeURIComponent(ciudad)}`
    );
  }

  // 🔹 GET: Búsqueda parcial (nombre, ciudad o dirección)
  search(term: string): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(
      `${this.apiUrl}/search/${encodeURIComponent(term)}`
    );
  }

  // 🔹 POST: Crear nueva sucursal
  crearSucursal(sucursal: CrearSucursalDTO): Observable<ApiResponse<Sucursal>> {
    return this.http.post<ApiResponse<Sucursal>>(this.apiUrl, sucursal);
  }

  // 🔹 PUT: Actualizar sucursal existente
  actualizarSucursal(
    id: number, 
    sucursal: ActualizarSucursalDTO
  ): Observable<ApiResponse<Sucursal>> {
    return this.http.put<ApiResponse<Sucursal>>(
      `${this.apiUrl}/${id}`, 
      sucursal
    );
  }

  // 🔹 DELETE: Eliminación lógica (soft delete)
  eliminarSucursal(id: number): Observable<ApiResponse<{ id: number }>> {
    return this.http.delete<ApiResponse<{ id: number }>>(
      `${this.apiUrl}/${id}`
    );
  }
}