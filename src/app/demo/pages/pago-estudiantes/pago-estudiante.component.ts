// pago-estudiante.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Importar el componente del comprobante
import { ComprobantePagoComponent, DatosComprobante } from './comprobante-pago/comprobante-pago.component';

import {
  PagoEstudianteService,
  EstudianteSearchResult,
  DeudaPendiente,
  RegistrarPagoDTO,
  ObtenerDeudasDTO
} from '../../../services/pago-estudiante.service';

@Component({
  selector: 'app-pago-estudiante',
  templateUrl: './pago-estudiante.component.html',
  standalone: true,
  imports: [
    SharedModule, 
    ReactiveFormsModule,
    CommonModule,
    ComprobantePagoComponent  
  ]
})
export class PagoEstudianteComponent implements OnInit {

  cargando = false;
  buscando = false;
  registrandoPago = false;
  modalPagoVisible = false;
  mostrarComprobante = false; 

  estudiantes: EstudianteSearchResult[] = [];
  deudas: DeudaPendiente[] = [];
  estudianteSeleccionado: EstudianteSearchResult | null = null;
  
  
  comprobanteDatos: DatosComprobante | null = null;

  buscarForm: FormGroup = this.fb.group({
    query: ['', [Validators.required, Validators.minLength(2)]]
  });

  pagoForm: FormGroup = this.fb.group({
    cobro_id: [null, Validators.required],
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

  private readonly ESTABLECIMIENTO = {
    nombre: 'Instituto IBCT',
    nit: '1234567890',
    direccion: 'Av. Principal #123',
    telefono: '+591 2 222-3333'
  };

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoEstudianteService
  ) {}

  ngOnInit(): void {
    this.buscarForm.get('query')!
      .valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((q: string) => q && q.trim().length >= 2)
      )
      .subscribe(query => {
        this.buscarEstudiantesAuto(query);
      });
  }

  buscarEstudiantesAuto(query: string): void {
    this.buscando = true;
    this.estudianteSeleccionado = null;
    this.deudas = [];

    this.pagoService.buscarEstudiantes({ query: query.trim() }).subscribe({
      next: (res) => {
        this.buscando = false;
        this.estudiantes = res.success ? (res.data?.estudiantes || []) : [];
      },
      error: () => {
        this.buscando = false;
        this.estudiantes = [];
      }
    });
  }

  fechaHoy(): string {
    const now = new Date();
    return now.toISOString().substring(0, 16); 
  }

  abrirModalPago(deuda: DeudaPendiente): void {
    this.prepararPago(deuda);
    this.modalPagoVisible = true;
  }

  cerrarModalPago(): void {
    this.modalPagoVisible = false;
    this.pagoForm.reset({
      cobro_id: null,
      monto: 0,
      metodo_pago: 'efectivo',
      numero_recibo: '',
      fecha_pago: this.fechaHoy(),
      observaciones: ''
    });
  }

  buscarEstudiantes(): void {
    if (this.buscarForm.invalid) {
      this.buscarForm.markAllAsTouched();
      return;
    }

    const query = this.buscarForm.get('query')?.value.trim();
    if (!query || query.length < 2) return;

    this.buscando = true;
    this.estudianteSeleccionado = null;
    this.deudas = [];

    this.pagoService.buscarEstudiantes({ query }).subscribe({
      next: (res) => {
        this.buscando = false;
        if (res.success && res.data?.estudiantes) {
          this.estudiantes = res.data.estudiantes as EstudianteSearchResult[];
        } else {
          this.estudiantes = [];
        }
      },
      error: () => {
        this.buscando = false;
        this.estudiantes = [];
      }
    });
  }

  cargarDeudasPendientes(inscripcionId: number): void {
    if (!inscripcionId || inscripcionId <= 0) {
      console.warn('ID de inscripción inválido:', inscripcionId);
      this.deudas = [];
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.pagoService.getDeudasPendientes({ inscripcion_id: inscripcionId }).subscribe({
      next: (res) => {
        this.cargando = false;
        this.deudas = res.success ? (res.data?.deudas || []) : [];
      },
      error: (err) => {
        console.error('Error 400 al cargar deudas:', err);
        this.cargando = false;
        this.deudas = [];
      }
    });
  }

  seleccionarEstudiante(estudiante: EstudianteSearchResult): void {
    console.log('Estudiante seleccionado:', estudiante); 

    if (!estudiante?.inscripcion_id) {
      console.error('El estudiante no tiene inscripcion_id válido');
      return;
    }

    this.estudianteSeleccionado = estudiante;
    this.estudiantes = [];
    this.buscarForm.patchValue({ query: estudiante.nombre_completo });
    this.cargarDeudasPendientes(estudiante.inscripcion_id);
  }

  prepararPago(deuda: DeudaPendiente): void {
    this.pagoForm.patchValue({
      cobro_id: deuda.cobro_id,
      monto: deuda.saldo_pendiente,
      metodo_pago: 'efectivo',
      numero_recibo: '',
      fecha_pago: this.fechaHoy(),
      observaciones: `Pago de: ${deuda.concepto}`
    });
  }

  registrarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }
    
    if (!this.estudianteSeleccionado) {
      console.error('No hay estudiante seleccionado');
      return;
    }

    const raw = this.pagoForm.getRawValue();
    this.registrandoPago = true;
    
    const pagoData: RegistrarPagoDTO = {
      cobro_id: raw.cobro_id,
      inscripcion_id: this.estudianteSeleccionado.inscripcion_id,
      monto: parseFloat(raw.monto),
      metodo_pago: raw.metodo_pago,
      numero_recibo: raw.numero_recibo?.trim() || null,
      fecha_pago: new Date(raw.fecha_pago).toISOString(),
      observaciones: raw.observaciones?.trim() || null,
      usuario_id: 1, 
      tipo_pago: 'deuda_existente'
    };

    console.log('Datos enviados al backend:', pagoData);

    this.pagoService.registrarPago(pagoData).subscribe({
      next: (res) => {
        this.registrandoPago = false;
        
        if (res.success) {
        
          this.generarComprobante(raw, res.data);
          
          if (this.estudianteSeleccionado) {
            this.cargarDeudasPendientes(this.estudianteSeleccionado.inscripcion_id);
          }
          
          
          this.pagoForm.reset({
            cobro_id: null,
            monto: 0,
            metodo_pago: 'efectivo',
            numero_recibo: '',
            fecha_pago: this.fechaHoy(),
            observaciones: ''
          });
          
          this.modalPagoVisible = false;
          
          this.mostrarComprobante = true;
        } else {
          
          console.error('Error:', res.message);
        }
      },
      error: (err) => {
        this.registrandoPago = false;
        console.error('Error al registrar el pago:', err);
        // this.toastr.error('Error al registrar el pago');
      }
    });
  }

 
  private generarComprobante(pagoRaw: any, respuestaBackend: any): void {
   
    const deudaSeleccionada = this.deudas.find(
      d => d.cobro_id === pagoRaw.cobro_id
    );

    this.comprobanteDatos = {
      establecimiento: this.ESTABLECIMIENTO.nombre,
      nit: this.ESTABLECIMIENTO.nit,
      direccion: this.ESTABLECIMIENTO.direccion,
      telefono: this.ESTABLECIMIENTO.telefono,
      numero_comprobante: respuestaBackend?.numero_comprobante || `CP-${Date.now()}`,
      fecha_emision: new Date().toISOString(),
      estudiante: this.estudianteSeleccionado!.nombre_completo,
      ci_estudiante: this.estudianteSeleccionado!.ci,
      curso: this.estudianteSeleccionado!.curso_nombre,
      concepto: deudaSeleccionada?.concepto || pagoRaw.observaciones || 'Pago de matrícula',
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
    if (!elemento) {
      console.error('Elemento comprobante no encontrado');
      return;
    }

    
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
    pdf.save(`comprobante-${Date.now()}.pdf`);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar PDF. Verifica que las librerías estén instaladas.');
  }
}

 
  cerrarComprobante(): void {
    this.mostrarComprobante = false;
    this.comprobanteDatos = null;
  }

  get f() {
    return this.buscarForm.controls;
  }

  get p() {
    return this.pagoForm.controls;
  }

  limpiarBusqueda(): void {
    this.estudianteSeleccionado = null;
    this.deudas = [];
    this.buscarForm.reset({ query: '' });
    this.estudiantes = [];
  }

  estadoBadge(estado: string): string {
    switch (estado) {
      case 'vencido': return 'badge bg-danger';
      case 'pendiente': return 'badge bg-warning';
      case 'parcial': return 'badge bg-info';
      case 'pagado': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  diasVencidoTexto(dias: number | null): string {
    if (dias === null || dias <= 0) return '';
    return `Vencido hace ${dias} día(s)`;
  }
}