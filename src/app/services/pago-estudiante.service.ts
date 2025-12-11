// pago-estudiante.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EstudianteSearchResult {
  estudiante_id: number;
  nombre_completo: string;
  estado: string;
  inscripcion_id: number;
  curso_nombre: string;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  horario: string;
  duracion_meses: number;
  fecha_inicio: string;
  monto_inscripcion: number;
  monto_mensual: number;
}

export interface DeudaPendiente {
  cobro_id: number;
  estudiante_id: number;
  estudiante_nombre: string;
  curso_nombre: string;
  tipo_cobro: string;
  concepto: string;
  monto_total: number;
  monto_pagado: number;
  saldo_pendiente: number;
  fecha_vencimiento: string; // YYYY-MM-DD
  estado: 'pendiente' | 'parcial' | 'pagado' | 'vencido';
  dias_vencido: number | null;
}

export interface PagoRegistrado {
  cobro_id: number;
  monto: number;
  metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
  numero_recibo?: string | null;
  fecha_pago: string; // ISO datetime
  observaciones?: string | null;
  usuario_registro_id?: number | null;
  usuario_registro_nombre?: string | null;
}

export interface CobroDetallado {
  cobro_id: number;
  tipo_cobro_id: number;
  concepto: string;
  monto_total: number;
  monto_pagado: number;
  saldo_pendiente: number;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'parcial' | 'pagado' | 'vencido';
  observaciones: string | null;
  pagos: PagoRegistrado[];
}

export interface InscripcionDetallada {
  inscripcion_id: number;
  fecha_inicio: string;
  monto_inscripcion: number;
  monto_mensual: number;
  curso_nombre: string;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  horario: string;
  duracion_meses: number;
  cobros: CobroDetallado[];
}

export interface EstudianteDetallado {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  estado: string;
  fecha_nacimiento: string;
  email: string;
  telefono: string;
}

export interface EstudianteConDetalles {
  estudiante: EstudianteDetallado;
  inscripciones: InscripcionDetallada[];
}

export interface BuscarEstudiantesDTO {
  query: string;
}

export interface RegistrarPagoDTO {
  cobro_id: number;
  inscripcion_id: number;
  monto: number;
  metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';
  numero_recibo?: string;
  fecha_pago?: string; 
  observaciones?: string;
  usuario_registro_id?: number; 
  usuario_id?: number;
  tipo_pago: 'deuda_existente';
}
export interface CobroDelDia {
  cobro_id: number;
  concepto: string;
  monto_total: string; 
  monto_pagado: string;
  saldo_pendiente: string;
  fecha_vencimiento: string; 
  estado_cobro_db: string;
  tipo_cobro: string;
  inscripcion_id: number;
  estudiante_id: number;
  nombre_estudiante: string;
  ci: string;
  telefono: string;
  email: string;
  curso: string;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  turno: string | null;
  horario: string;
  fecha_inicio: string;
  fecha_fin_estimada: string | null;
  monto_total_inscripcion: string;
  monto_mensual: string;
  estado_pago_calculado: 'Pago pendiente' | 'Pago vencido' | 'Pagado' | 'Pago no generado';
}

export interface ObtenerDeudasDTO {
  inscripcion_id: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: any; 
}


@Injectable({
  providedIn: 'root'
})
export class PagoEstudianteService {
  private baseUrl = `${environment.apiUrl}/pagos-estudiante`; 

  constructor(private http: HttpClient) {}

  // POST /api/pagos-estudiante/buscar
  buscarEstudiantes(dto: BuscarEstudiantesDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/buscar`, dto);
  }

  // POST /api/pagos-estudiante/estudiante-detalle
  getEstudianteDetalles(dto: { estudiante_id: number }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/estudiante-detalle`, dto);
  }

  // POST /api/pagos-estudiante/deudas-pendientes
  getDeudasPendientes(dto: ObtenerDeudasDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/deudas-pendientes`, dto);
  }

  // POST /api/pagos-estudiante/registrar
  registrarPago(dto: RegistrarPagoDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/registrar`, dto);
  }

  // POST /api/pagos-estudiante/resumen-financiero
  getResumenFinanciero(dto: { estudiante_id: number }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/resumen-financiero`, dto);
  }

  // GET /api/pagos-estudiante/tipos-cobro
  getTiposCobro(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/tipos-cobro`);
  }

  // GET /api/pagos-estudiante/cobros-del-dia
  getCobrosDelDia(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/cobros-del-dia`);
  }
}