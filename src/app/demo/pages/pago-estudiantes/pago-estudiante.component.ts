// pago-estudiante.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
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
  imports: [SharedModule, ReactiveFormsModule]
})
export class PagoEstudianteComponent implements OnInit {

  cargando = false;
  buscando = false;
  registrandoPago = false;
  modalPagoVisible = false;

  estudiantes: EstudianteSearchResult[] = [];
  deudas: DeudaPendiente[] = [];
  estudianteSeleccionado: EstudianteSearchResult | null = null;

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

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoEstudianteService
  ) {}

  ngOnInit(): void {}

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
      } else {
        // this.toastr.error(res.message || 'Error al registrar pago');
      }
    },
    error: () => {
      this.registrandoPago = false;
      // this.toastr.error('Error al registrar el pago');
    }
  });
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