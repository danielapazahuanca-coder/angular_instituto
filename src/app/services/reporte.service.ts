import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReporteFinancieroItem {
  estudiante_nombre: string;
  estudiante_apellido: string;
  curso_nombre: string;
  concepto: string;
  monto_total: string;        
  monto_pagado: string;
  saldo_pendiente: string;
  estado_cobro: string;
  monto_pago: string;
  metodo_pago: string;
  fecha_pago: string;        
  numero_recibo: string | null;
  registrado_por: string | null;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ReporteFinancieroItem[] | null;
}

export interface FiltrosReporteFinanciero {
  fecha_inicio: string;
  fecha_fin: string;    
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private baseUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getReporteFinanciero(filtros: FiltrosReporteFinanciero): Observable<ApiResponse> {
    let params = new HttpParams()
      .set('fecha_inicio', filtros.fecha_inicio)
      .set('fecha_fin', filtros.fecha_fin);

    return this.http.get<ApiResponse>(`${this.baseUrl}/financiero`, { params });
  }

  generarPdfFinanciero(filtros: FiltrosReporteFinanciero): Observable<ApiResponse & { data: { pdf: string } }> {
    let params = new HttpParams()
      .set('fecha_inicio', filtros.fecha_inicio)
      .set('fecha_fin', filtros.fecha_fin);

    return this.http.get<ApiResponse & { data: { pdf: string } }>(
      `${this.baseUrl}/financiero-pdf`,
      { params }
    );
  }
}