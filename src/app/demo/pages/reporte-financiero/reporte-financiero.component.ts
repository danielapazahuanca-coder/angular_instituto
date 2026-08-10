
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReporteService, ReporteFinancieroItem, FiltrosReporteFinanciero } from '../../../services/reporte.service';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

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
  reporteFiltrado: ReporteFinancieroItem[] = [];
  usuarioActual: any = null;
  sucursalUsuario: number | null = null;
  rolUsuario: string | null = null;
  usuarioIdActual: number | null = null;
  reporteCompleto: ReporteFinancieroItem[] = [];


  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private authService: AuthService
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
    return date.toISOString().split('T')[0]; 
  }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioActual = user;
      this.usuarioIdActual = user.id;
      this.sucursalUsuario = user.sucursal_id;
      this.rolUsuario = user.rol;
      
      console.log('📝 ID del usuario logueado:', this.usuarioIdActual);
      console.log('🏢 ID de la sucursal del usuario logueado:', this.sucursalUsuario);
      console.log('👤 Rol del usuario logueado:', this.rolUsuario);
    }
  }

    private esRolRestringido(): boolean {
    return this.rolUsuario?.toLowerCase() !== 'admin';
  }
    private construirFiltros(): FiltrosReporteFinanciero {
    const filtrosBase = this.formulario.value;

    if (this.esRolRestringido()) {
      return {
        ...filtrosBase,
        sucursal_id: this.sucursalUsuario
      };
    }

    return filtrosBase;
  }
    private filtrarPorRolYSucursal(items: ReporteFinancieroItem[]): ReporteFinancieroItem[] {
    if (!this.rolUsuario) {
      return [];
    }

    if (!this.esRolRestringido()) {
      return items; 
    }

    if (this.sucursalUsuario == null) {
      return []; 
    }

    return items.filter(item => (item as any).sucursal_id === this.sucursalUsuario);
  }
  generarReporte(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const filtros = this.construirFiltros();

    if (filtros.fecha_inicio > filtros.fecha_fin) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    this.cargando = true;
    this.reporte = [];
    this.reporteCompleto = [];

    this.reporteService.getReporteFinanciero(filtros).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.reporteCompleto = res.data;
          this.reporte = this.filtrarPorRolYSucursal(this.reporteCompleto);
          console.log('Reporte financiero cargado:', this.reporte);
        } else {
          this.reporte = [];
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.reporte = [];
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

  descargarPdf(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const filtros = this.construirFiltros(); 

    if (filtros.fecha_inicio > filtros.fecha_fin) {
      alert('Rango de fechas inválido');
      return;
    }

    this.cargando = true;
    this.reporteService.generarPdfFinanciero(filtros).subscribe({
      next: (res) => {
        if (res.success && res.data?.pdf) {
          const base64 = res.data.pdf;
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `reporte-financiero-${filtros.fecha_inicio}-a-${filtros.fecha_fin}.pdf`;
          link.click();
          window.URL.revokeObjectURL(link.href);
        } else {
          console.error('Error al generar el PDF:', res.message);
          alert('No se pudo generar el PDF.');
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert('Error al generar el PDF.');
      }
    });
  }

}