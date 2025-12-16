// reporte-financiero.component.ts

import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReporteService, ReporteFinancieroItem, FiltrosReporteFinanciero } from '../../../services/reporte.service';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reporte-financiero',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './reporte-financiero.component.html'
  //styleUrls: ['./reporte-financiero.component.scss']
})
export class ReporteFinancieroComponent {
  reporte: ReporteFinancieroItem[] = [];
  cargando = false;
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService
  ) {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    this.formulario = this.fb.group({
      fecha_inicio: [this.formatDate(primerDia), [Validators.required]],
      fecha_fin: [this.formatDate(ultimoDia), [Validators.required]]
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  generarReporte(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const filtros: FiltrosReporteFinanciero = this.formulario.value;

    if (filtros.fecha_inicio > filtros.fecha_fin) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    this.cargando = true;
    this.reporte = [];

    this.reporteService.getReporteFinanciero(filtros).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.reporte = res.data;
        } else {
          this.reporte = [];
          // alert(res.message || 'No se encontraron registros.');
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.reporte = [];
        // alert('Error al cargar el reporte.');
      }
    });
  }

  get f() {
    return this.formulario.controls;
  }

  totalIngresos(): number {
    return this.reporte.reduce((total, item) => {
      const monto = parseFloat(item.monto_pago) || 0;
      return total + monto;
    }, 0);
  }

  metodoPagoLabel(metodo: string): string {
    const map: Record<string, string> = {
      efectivo: 'Efectivo',
      qr: 'QR',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta'
    };
    return map[metodo] || metodo;
  }

  estadoCobroLabel(estado: string): string {
    const map: Record<string, string> = {
      pagado: 'Pagado',
      pendiente: 'Pendiente',
      parcial: 'Parcial',
      vencido: 'Vencido'
    };
    return map[estado] || estado;
  }
}