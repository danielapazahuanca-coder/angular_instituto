// services/registro-completo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Horario {
  id: number;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
  dias_semana: string;
}

export interface Curso {
  id: number;
  nombre: string;
  duracion_meses: number;
  precio_base: number;
  descripcion?: string;
  activo?: boolean;
  precio_mensual?: string;
  horarios?: Horario[];
}

export interface RegistroCompletoDTO {
  
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  ci: string | null;
  telefono: string | null;
  email: string;
  direccion: string | null;
  fecha_nacimiento: string | null;
  observaciones_estudiante: string | null;
  
  curso_id: number;
  horario_id: number; 
  fecha_inicio: string;
  fecha_fin_estimada: string;
  
  monto_inscripcion: number;
  monto_mensual: number;
  duracion_meses: number;
  descuento: number;
  tipo_pago: string;
  
  pago_inscripcion?: number;
  metodo_pago?: string;
  numero_recibo?: string | null;
  
  observaciones_inscripcion: string | null;
  usuario_registro_id: number | null;
  estado : string;
}

export interface EstudianteInscrito {
  estudiante_id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  ci?: string | null;
  telefono?: string | null;
  email: string;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  observaciones_estudiante?: string | null;
  inscripcion_id: number;
  curso: string;
  curso_id: number;
  horario_id?: number;
  turno?: string;           // Cambiado de horario_turno a turno
  hora_inicio?: string;     // Nuevo campo
  hora_fin?: string;        // Nuevo campo
  dias_semana?: string; 
  fecha_inicio: string;
  fecha_fin_estimada: string;
  monto_total: number;
  monto_inscripcion?: number;
  monto_mensual: number;
  duracion_meses?: number;
  descuento?: number;
  tipo_pago?: string;
  observaciones_inscripcion?: string | null;
  estado? : string;
  
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroCompletoService {
  private apiUrl = `${environment.apiUrl}`; 

  constructor(private http: HttpClient) {}

    
  getCursosConHorarios(): Observable<ApiResponse<Curso[]>> {
    return this.http.get<ApiResponse<Curso[]>>(`${this.apiUrl}/cursos-con-horarios`);
  }

  getCursos(): Observable<ApiResponse<Curso[]>> {
    return this.http.get<ApiResponse<Curso[]>>(`${this.apiUrl}/cursos`);
  }

registrarEstudianteCompleto(datos: RegistroCompletoDTO): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.apiUrl}/registro-completo`, 
    datos
  );
}

  getEstudiantesInscritos(): Observable<ApiResponse<EstudianteInscrito[]>> {
    return this.http.get<ApiResponse<EstudianteInscrito[]>>(
      `${this.apiUrl}/registro-completo`
    );
  }

  getEstudianteInscrito(estudianteId: number): Observable<ApiResponse<EstudianteInscrito>> {
    return this.http.get<ApiResponse<EstudianteInscrito>>(
      `${this.apiUrl}/estudiante-detalle/${estudianteId}`
    );
  }

  actualizarEstudiante(estudianteId: number, datos: RegistroCompletoDTO): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/estudiante-detalle/${estudianteId}`,
      datos
    );
  }

  eliminarEstudiante(estudianteId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/estudiantes/${estudianteId}`
    );
  }
}