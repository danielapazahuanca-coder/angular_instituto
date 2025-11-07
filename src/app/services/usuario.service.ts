// usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modelo completo (lectura)
export interface Usuario {
  id: number;
  rol_id: number;
  rol_nombre: string;     // solo viene en GET
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  email: string;
  telefono: string;
  estado: string;         // solo viene en GET
  created_at: string;     // solo viene en GET
}

// DTO para CREAR (solo campos que envía el frontend)
export interface CrearUsuarioDTO {
  rol_id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  email: string;
  telefono: string;
  password: string;
}

// DTO para ACTUALIZAR (password opcional)
export interface ActualizarUsuarioDTO {
  rol_id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  email: string;
  telefono: string;
  password?: string; // opcional
}

// Respuesta genérica
export interface ApiResponse {
  success: boolean;
  message: string;
  data: Usuario | Usuario[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/instituto_ibct/api/usuarios';

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