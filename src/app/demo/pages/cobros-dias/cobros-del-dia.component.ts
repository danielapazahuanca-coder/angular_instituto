import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { 
  PagoEstudianteService, 
  CobroDelDia, 
  RegistrarPagoDTO 
} from '../../../services/pago-estudiante.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ComprobantePagoComponent, DatosComprobante } from '../pago-estudiantes/comprobante-pago/comprobante-pago.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cobros-del-dia',
  standalone: true,
  imports: [
    SharedModule, 
    ReactiveFormsModule,
    CommonModule,
    ComprobantePagoComponent  
  ],
  templateUrl: './cobros-del-dia.component.html'
})
export class CobrosDelDiaComponent implements OnInit {
  cobrosData: any = null;
  cobros: CobroDelDia[] = [];
  cobrosFiltrados: CobroDelDia[] = [];
  loading = false;
  total = 0;
  
  modalPagoVisible = false;
  registrandoPago = false;
  cobroSeleccionado: CobroDelDia | null = null;
  

  mostrarComprobante = false;
  comprobanteDatos: DatosComprobante | null = null;

  filtrosForm: FormGroup = this.fb.group({
    curso: [''],
    estudiante: ['']
  });

  pagoForm: FormGroup = this.fb.group({
    cobro_id: [null, Validators.required],
    inscripcion_id: [null, Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodo_pago: ['efectivo', Validators.required],
    numero_recibo: [''],
    fecha_pago: [this.fechaHoy(), Validators.required],
    observaciones: ['']
  });

  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'qr', label: 'QR' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' }
  ];

  cursosUnicos: string[] = [];
  estudiantesUnicos: string[] = [];
    usuarioActual: any = null;
  sucursalUsuario: number | null = null;
  rolUsuario: string | null = null;
  usuarioIdActual: number | null = null;

  private readonly ESTABLECIMIENTO = {
    nombre: 'Instituto IBCT',
    nit: '1234567890',
    direccion: 'Av. Principal #123',
    telefono: '+591 2 222-3333'
  };

  constructor(
    private pagoService: PagoEstudianteService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

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
    this.loadCobrosDelDia();

    this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  fechaHoy(): string {
    const now = new Date();
    return now.toISOString().substring(0, 16);
  }

  loadCobrosDelDia(): void {
    this.loading = true;
    this.pagoService.getCobrosDelDia().subscribe({
      next: (response) => {
        const todosLosCobros: CobroDelDia[] = response.data?.cobros || [];

        this.cobros = this.filtrarPorRolYSucursal(todosLosCobros);

        this.cursosUnicos = [...new Set(this.cobros.map(c => c.curso).filter(Boolean))];
        this.estudiantesUnicos = [...new Set(this.cobros.map(c => c.nombre_estudiante).filter(Boolean))];

        this.cobrosFiltrados = [...this.cobros];

        this.total = this.cobros.reduce(
          (acc, c) => acc + parseFloat(c.saldo_pendiente as any || '0'),
          0
        );

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al llamar al servicio:', error);
        this.loading = false;
        alert('Error en la llamada. Revisa la consola.');
      }
    });
  }
    private filtrarPorRolYSucursal(cobros: CobroDelDia[]): CobroDelDia[] {
    if (!this.rolUsuario) {
      return [];
    }

    const rol = this.rolUsuario.toLowerCase();

    if (rol === 'admin') {
      return cobros;
    }

    if (this.sucursalUsuario == null) {
      return []; 
    }

    return cobros.filter(c => (c as any).sucursal_id === this.sucursalUsuario);
  }


  aplicarFiltros(): void {
    const { curso, estudiante } = this.filtrosForm.value;

    this.cobrosFiltrados = this.cobros.filter(cobro => {
      let cumpleCurso = true;
      let cumpleEstudiante = true;

      if (curso && curso.trim() !== '') {
        cumpleCurso = cobro.curso?.toLowerCase().includes(curso.toLowerCase().trim());
      }

      if (estudiante && estudiante.trim() !== '') {
        cumpleEstudiante = cobro.nombre_estudiante?.toLowerCase().includes(estudiante.toLowerCase().trim());
      }

      return cumpleCurso && cumpleEstudiante;
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      curso: '',
      estudiante: ''
    });
    this.cobrosFiltrados = [...this.cobros];
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pago pendiente': return 'estado-pendiente';
      case 'Pago vencido': return 'estado-vencido';
      case 'Pagado': return 'estado-pagado';
      default: return 'estado-otro';
    }
  }

  abrirModalPago(cobro: CobroDelDia): void {
    this.cobroSeleccionado = cobro;
    this.prepararPago(cobro);
    this.modalPagoVisible = true;
  }

  cerrarModalPago(): void {
    this.modalPagoVisible = false;
    this.cobroSeleccionado = null;
    this.pagoForm.reset({
      cobro_id: null,
      inscripcion_id: null,
      monto: 0,
      metodo_pago: 'efectivo',
      numero_recibo: '',
      fecha_pago: this.fechaHoy(),
      observaciones: ''
    });
  }

  prepararPago(cobro: CobroDelDia): void {
    const saldoPendiente = parseFloat(cobro.saldo_pendiente);
    
    this.pagoForm.patchValue({
      cobro_id: cobro.cobro_id,
      inscripcion_id: cobro.inscripcion_id,
      monto: saldoPendiente,
      metodo_pago: 'efectivo',
      numero_recibo: '',
      fecha_pago: this.fechaHoy(),
      observaciones: `Pago de: ${cobro.concepto} - ${cobro.nombre_estudiante}`
    });
  }

  registrarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const raw = this.pagoForm.getRawValue();
    this.registrandoPago = true;

    const pagoData: RegistrarPagoDTO = {
      cobro_id: raw.cobro_id,
      inscripcion_id: raw.inscripcion_id,
      monto: parseFloat(raw.monto),
      metodo_pago: raw.metodo_pago,
      numero_recibo: raw.numero_recibo?.trim() || null,
      fecha_pago: new Date(raw.fecha_pago).toISOString(),
      observaciones: raw.observaciones?.trim() || null,
      usuario_id: this.usuarioIdActual || 0,
      tipo_pago: 'deuda_existente',
      sucursal_id: this.sucursalUsuario || null
    };

    console.log('Datos enviados al backend:', pagoData);

    this.pagoService.registrarPago(pagoData).subscribe({
      next: (res) => {
        this.registrandoPago = false;
        if (res.success) {
         
          this.generarComprobante(raw, res.data);
          
          alert('Pago registrado exitosamente');
          this.cerrarModalPago();
          this.loadCobrosDelDia(); 
          
        
          this.mostrarComprobante = true;
        } else {
          alert(res.message || 'Error al registrar pago');
        }
      },
      error: (err) => {
        this.registrandoPago = false;
        console.error('Error al registrar pago:', err);
        alert('Error al registrar el pago');
      }
    });
  }

  
  private generarComprobante(pagoRaw: any, respuestaBackend: any): void {
    if (!this.cobroSeleccionado) return;

    
    const ciEstudiante = (this.cobroSeleccionado as any).ci || 
                         (this.cobroSeleccionado as any).documento || 
                         (this.cobroSeleccionado as any).codigo_estudiante || 
                         'N/A';

    this.comprobanteDatos = {
      establecimiento: this.ESTABLECIMIENTO.nombre,
      nit: this.ESTABLECIMIENTO.nit,
      direccion: this.ESTABLECIMIENTO.direccion,
      telefono: this.ESTABLECIMIENTO.telefono,
      numero_comprobante: respuestaBackend?.numero_comprobante || `CD-${Date.now()}`,
      fecha_emision: new Date().toISOString(),
      estudiante: this.cobroSeleccionado.nombre_estudiante,
      ci_estudiante: ciEstudiante,
      curso: this.cobroSeleccionado.curso,
      concepto: this.cobroSeleccionado.concepto || pagoRaw.observaciones || 'Pago de mensualidad',
      monto_total: parseFloat(pagoRaw.monto),
      metodo_pago: pagoRaw.metodo_pago,
      numero_recibo: pagoRaw.numero_recibo || undefined,
      observaciones: pagoRaw.observaciones || undefined,
      usuario_cajero: 'Cajero 01', 
      firma_digital: respuestaBackend?.qr_code_url || undefined
    };
  }

 
  imprimirComprobante(): void {
    const comprobanteElement = document.getElementById('comprobante');
    if (comprobanteElement) {
      window.print();
    }
  }

  async descargarPDF(): Promise<void> {
    try {
      const jsPDFModule = await import('jspdf');
      const html2canvasModule = await import('html2canvas');
      
      const jsPDF = (jsPDFModule as any).default || (jsPDFModule as any).jsPDF;
      const html2canvas = (html2canvasModule as any).default || html2canvasModule;
      
      const elemento = document.getElementById('comprobante');
      if (!elemento) return;

      const canvas = await html2canvas(elemento, {
        scale: 2,
        width: 304,
        windowWidth: 304,
        useCORS: true,
        logging: false
      } as any);

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      });

      const imgHeight = (canvas.height * 80) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, 80, imgHeight);
      pdf.save(`comprobante-cobro-${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF. Verifica que las librerías estén instaladas.');
    }
  }

  cerrarComprobante(): void {
    this.mostrarComprobante = false;
    this.comprobanteDatos = null;
  }

  get p() {
    return this.pagoForm.controls;
  }

  puedeCobrar(cobro: CobroDelDia): boolean {
    return cobro.estado_pago_calculado !== 'Pagado' && 
           cobro.estado_pago_calculado !== 'Pago no generado';
  }
}