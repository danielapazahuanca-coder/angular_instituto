import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DatosComprobante {
  establecimiento: string;
  nit: string;
  direccion: string;
  telefono: string;
  numero_comprobante: string;
  fecha_emision: string;
  estudiante: string;
  ci_estudiante: string;
  curso: string;
  concepto: string;
  monto_total: number;
  metodo_pago: string;
  numero_recibo?: string;
  observaciones?: string;
  usuario_cajero: string;
  firma_digital?: string;
}

@Component({
  selector: 'app-comprobante-pago',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket" id="comprobante">
      <!-- Encabezado -->
      <div class="header text-center">
        <h3 class="mb-0">{{ datos.establecimiento }}</h3>
        <p class="mb-1 small">NIT: {{ datos.nit }}</p>
        <p class="mb-1 small">{{ datos.direccion }}</p>
        <p class="mb-1 small">Telf: {{ datos.telefono }}</p>
        <hr class="dashed">
      </div>

      <!-- Datos del comprobante -->
      <div class="body">
        <div class="row">
          <span class="label">Comprobante N°:</span>
          <span class="value">{{ datos.numero_comprobante }}</span>
        </div>
        <div class="row">
          <span class="label">Fecha:</span>
          <span class="value">{{ datos.fecha_emision | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <hr class="dashed">

        <div class="row">
          <span class="label">Estudiante:</span>
          <span class="value">{{ datos.estudiante }}</span>
        </div>
        <div class="row">
          <span class="label">CI:</span>
          <span class="value">{{ datos.ci_estudiante }}</span>
        </div>
        <div class="row">
          <span class="label">Curso:</span>
          <span class="value">{{ datos.curso }}</span>
        </div>
        <hr class="dashed">

        <div class="row">
          <span class="label">Concepto:</span>
          <span class="value">{{ datos.concepto }}</span>
        </div>
        <div class="row">
          <span class="label">Método:</span>
          <span class="value">{{ getMetodoPagoLabel() }}</span>
        </div>
        <div class="row" *ngIf="datos.numero_recibo">
          <span class="label">N° Recibo:</span>
          <span class="value">{{ datos.numero_recibo }}</span>
        </div>
        <hr class="dashed">

        <!-- Total -->
        <div class="total">
          <span class="label">TOTAL PAGADO:</span>
          <span class="value bold">{{ datos.monto_total | currency:'Bs ':'symbol':'1.2' }}</span>
        </div>

        <div class="row" *ngIf="datos.observaciones">
          <span class="label">Obs:</span>
          <span class="value small">{{ datos.observaciones }}</span>
        </div>
      </div>

      <!-- Pie -->
      <div class="footer text-center mt-3">
        <hr class="dashed">
        <p class="small mb-1">Cajero: {{ datos.usuario_cajero }}</p>
        <p class="small mb-2">¡Gracias por su pago!</p>
        <div *ngIf="datos.firma_digital" class="qr">
          <img [src]="datos.firma_digital" alt="QR" width="80" />
        </div>
        <p class="tiny mt-2">Este comprobante es válido solo con sello y firma.</p>
      </div>
    </div>
  `,
  styleUrls: ['./comprobante-pago.component.css']
})
export class ComprobantePagoComponent {
  @Input() datos!: DatosComprobante;

  getMetodoPagoLabel(): string {
    const metodos: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'qr': 'QR',
      'transferencia': 'Transferencia',
      'tarjeta': 'Tarjeta'
    };
    return metodos[this.datos.metodo_pago] || this.datos.metodo_pago;
  }

  imprimir(): void {
    setTimeout(() => {
      window.print();
    }, 100);
  }
}