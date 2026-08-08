import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoMovimiento = 'ingreso' | 'egreso';
export type MetodoPago = 'efectivo' | 'qr' | 'transferencia' | 'tarjeta';

export interface TipoMovimientoDTO {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface MovimientoFinanciero {
  id: number;
  tipo_movimiento: TipoMovimiento;
  tipo_movimiento_id: number;
  concepto: string;
  monto: number;
  metodo_pago: MetodoPago;
  pago_id: number | null;
  fecha_movimiento: string; 
  descripcion: string | null;
  comprobante: string | null;
  usuario_registro_id: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  tipo_movimiento_nombre?: string; 
  sucursal_id?: number | null;
}

export interface CrearMovimientoFinancieroDTO {
  tipo_movimiento: TipoMovimiento;
  tipo_movimiento_id: number;
  concepto: string;
  monto: number;
  metodo_pago: MetodoPago;
  pago_id?: number | null;
  fecha_movimiento: string; 
  descripcion?: string | null;
  comprobante?: string | null;
  usuario_registro_id?: number | null;
  sucursal_id?: number | null;
}

export interface ActualizarMovimientoFinancieroDTO {
  tipo_movimiento?: TipoMovimiento;
  tipo_movimiento_id?: number;
  concepto?: string;
  monto?: number;
  metodo_pago?: MetodoPago;
  pago_id?: number | null;
  fecha_movimiento?: string;
  descripcion?: string | null;
  comprobante?: string | null;
  usuario_registro_id?: number | null;
  sucursal_id?: number | null;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: MovimientoFinanciero | MovimientoFinanciero[] | null;
}

export interface TiposMovimientoResponse {
  success: boolean;
  message: string;
  data: TipoMovimientoDTO[] | null;
}
export interface TotalesFinancieros {
  total_ingresos: number;
  total_egresos: number;
  ganancia_neta: number;
}

export interface TotalesResponse {
  success: boolean;
  message: string;
  data: TotalesFinancieros;
}

@Injectable({
  providedIn: 'root'
})
export class MovimientoFinancieroService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  getMovimientos(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getMovimientoById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearMovimiento(movimiento: CrearMovimientoFinancieroDTO): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, movimiento);
  }

  actualizarMovimiento(id: number, movimiento: ActualizarMovimientoFinancieroDTO): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, movimiento);
  }

  eliminarMovimiento(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

    getTiposMovimiento(): Observable<TiposMovimientoResponse> {
     
      return this.http.get<TiposMovimientoResponse>(`${environment.apiUrl}/tipos-movimiento`);
    }

    getTotales(): Observable<TotalesResponse> {
      return this.http.get<TotalesResponse>(`${environment.apiUrl}/movimientos-totales`);
    }
}