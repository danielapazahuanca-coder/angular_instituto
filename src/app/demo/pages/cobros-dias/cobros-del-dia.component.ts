// src/app/demo/pages/cobros-dias/cobros-del-dia.component.ts

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

@Component({
  selector: 'app-cobros-del-dia',
  imports: [SharedModule, ReactiveFormsModule],
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

  constructor(
    private pagoService: PagoEstudianteService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
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
        console.log('🔍 Respuesta completa del servicio:', response);
        this.cobros = response.data?.cobros || [];
        
        // Extraer cursos y estudiantes únicos para los filtros
        this.cursosUnicos = [...new Set(this.cobros.map(c => c.curso).filter(Boolean))];
        this.estudiantesUnicos = [...new Set(this.cobros.map(c => c.nombre_estudiante).filter(Boolean))];
        
        this.cobrosFiltrados = [...this.cobros];
        this.total = response.data?.total || 0;
        
        // DEBUG: Ver los estados de cada cobro
        console.log('📊 Estados de cobros:', this.cobros.map(c => ({
          nombre: c.nombre_estudiante,
          estado: c.estado_pago_calculado,
          puedeCobrar: this.puedeCobrar(c)
        })));
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al llamar al servicio:', error);
        this.loading = false;
        alert('Error en la llamada. Revisa la consola.');
      }
    });
  }

  aplicarFiltros(): void {
    const { curso, estudiante } = this.filtrosForm.value;
    
    this.cobrosFiltrados = this.cobros.filter(cobro => {
      let cumpleCurso = true;
      let cumpleEstudiante = true;

      // Filtro por curso (búsqueda parcial e insensible a mayúsculas)
      if (curso && curso.trim() !== '') {
        cumpleCurso = cobro.curso?.toLowerCase().includes(curso.toLowerCase().trim());
      }

      // Filtro por estudiante (búsqueda parcial e insensible a mayúsculas)
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

  // Métodos para el modal de pago
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
      usuario_id: 1,
      tipo_pago: 'deuda_existente'
    };

    console.log('Datos enviados al backend:', pagoData);

    this.pagoService.registrarPago(pagoData).subscribe({
      next: (res) => {
        this.registrandoPago = false;
        if (res.success) {
          alert('Pago registrado exitosamente');
          this.cerrarModalPago();
          this.loadCobrosDelDia(); // Recargar la lista
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

  get p() {
    return this.pagoForm.controls;
  }

  // Método para determinar si se puede cobrar
  puedeCobrar(cobro: CobroDelDia): boolean {
    return cobro.estado_pago_calculado !== 'Pagado' && 
           cobro.estado_pago_calculado !== 'Pago no generado';
  }
}