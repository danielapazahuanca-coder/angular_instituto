// usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'secretaria'; 
  sucursal_id: number;
  activo: boolean;
  fecha_creacion: string; 
}


export interface CrearUsuarioDTO {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol?: 'admin' | 'secretaria'; 
  sucursal_id: number;
  activo?: boolean; 
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string; 
  rol?: 'admin' | 'secretaria';
  sucursal_id: number;
  activo?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Usuario | Usuario[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  crearUsuario(usuario: CrearUsuarioDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: ActualizarUsuarioDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}