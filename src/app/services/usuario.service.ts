// usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

export interface Usuario {
  id: number;
  rol_id: number;
  rol_nombre: string; 
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  email: string;
  telefono: string;
  estado: string;     
  created_at: string;
}

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

export interface ActualizarUsuarioDTO {
  rol_id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  email: string;
  telefono: string;
  password?: string;
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