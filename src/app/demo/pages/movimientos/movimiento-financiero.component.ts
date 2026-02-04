// movimiento-financiero.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  MovimientoFinancieroService,
  MovimientoFinanciero,
  CrearMovimientoFinancieroDTO,
  ActualizarMovimientoFinancieroDTO,
  TipoMovimiento,
  MetodoPago,
  TipoMovimientoDTO
} from '../../../services/movimiento-financiero.service';

@Component({
  selector: 'app-movimiento-financiero',
  templateUrl: './movimiento-financiero.component.html',
  imports: [SharedModule, ReactiveFormsModule]
})
export class MovimientoFinancieroComponent implements OnInit {
  movimientos: MovimientoFinanciero[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  movimientoActual: MovimientoFinanciero | null = null;
  movimientosFiltrados: MovimientoFinanciero[] = [];

    filtrosForm: FormGroup = this.fb.group({
    tipo_movimiento: [''],
    fecha_movimiento: ['']
  });

  movimientoForm: FormGroup = this.fb.group({
    id: [null],
    tipo_movimiento: ['ingreso', [Validators.required]],
    tipo_movimiento_id: [null, [Validators.required]],
    concepto: ['', [Validators.required]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodo_pago: ['efectivo', [Validators.required]],
    pago_id: [null],
    fecha_movimiento: ['', [Validators.required]],
    descripcion: [''],
    comprobante: [''],
    usuario_registro_id: [null]
  });

  tipoMovimientoOpciones: TipoMovimientoDTO[] = [];
  metodoPagoOpciones: { value: MetodoPago; label: string }[] = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'qr', label: 'QR' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' }
  ];

  constructor(
    private fb: FormBuilder,
    private movimientoService: MovimientoFinancieroService
  ) {}

  ngOnInit(): void {
    this.cargarTiposMovimiento();
    this.cargarMovimientos();

        this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
    console.log('datos',this.cargarTiposMovimiento);
  }

  cargarTiposMovimiento(): void {
    this.movimientoService.getTiposMovimiento().subscribe({
      next: (res) => {
        this.tipoMovimientoOpciones = res.success ? (res.data as TipoMovimientoDTO[]) : [];
        // Establecer valor por defecto si hay opciones
        if (this.tipoMovimientoOpciones.length > 0 && !this.movimientoForm.value.tipo_movimiento_id) {
          this.movimientoForm.patchValue({
            tipo_movimiento_id: this.tipoMovimientoOpciones[0].id
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar tipos de movimiento:', err);
      }
    });
  }

  cargarMovimientos(): void {
    this.cargando = true;
    this.movimientoService.getMovimientos().subscribe({
      next: (res) => {
        this.movimientos = res.success ? (res.data as MovimientoFinanciero[]) : [];
        this.movimientosFiltrados = [...this.movimientos];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

   aplicarFiltros(): void {
    const { tipo_movimiento, fecha_movimiento } = this.filtrosForm.value;
    
    this.movimientosFiltrados = this.movimientos.filter(movimiento => {
      let cumpleTipo = true;
      let cumpleFecha = true;

      // Filtro por tipo de movimiento
      if (tipo_movimiento && tipo_movimiento !== '') {
        cumpleTipo = movimiento.tipo_movimiento === tipo_movimiento;
      }

      // Filtro por fecha
      if (fecha_movimiento && fecha_movimiento !== '') {
        // Comparar solo la fecha (sin hora)
        const fechaMovimiento = new Date(movimiento.fecha_movimiento).toISOString().split('T')[0];
        cumpleFecha = fechaMovimiento === fecha_movimiento;
      }

      return cumpleTipo && cumpleFecha;
    });
  }
    limpiarFiltros(): void {
    this.filtrosForm.reset({
      tipo_movimiento: '',
      fecha_movimiento: ''
    });
    this.movimientosFiltrados = [...this.movimientos];
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.movimientoActual = null;
    this.movimientoForm.reset({
      id: null,
      tipo_movimiento: 'ingreso',
      tipo_movimiento_id: this.tipoMovimientoOpciones.length ? this.tipoMovimientoOpciones[0].id : null,
      concepto: '',
      monto: 0,
      metodo_pago: 'efectivo',
      pago_id: null,
      fecha_movimiento: new Date().toISOString().split('T')[0], // hoy en formato YYYY-MM-DD
      descripcion: '',
      comprobante: '',
      usuario_registro_id: null
    });
    this.modalVisible = true;
  }

  abrirModalEditar(id: number): void {
    this.cargando = true;
    this.movimientoService.getMovimientoById(id).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.success && res.data) {
          const movimiento = res.data as MovimientoFinanciero;
          this.editando = true;
          this.movimientoActual = movimiento;

          this.movimientoForm.patchValue({
            id: movimiento.id,
            tipo_movimiento: movimiento.tipo_movimiento,
            tipo_movimiento_id: movimiento.tipo_movimiento_id,
            concepto: movimiento.concepto,
            monto: movimiento.monto,
            metodo_pago: movimiento.metodo_pago,
            pago_id: movimiento.pago_id,
            fecha_movimiento: movimiento.fecha_movimiento,
            descripcion: movimiento.descripcion || '',
            comprobante: movimiento.comprobante || '',
            usuario_registro_id: movimiento.usuario_registro_id
          });

          this.modalVisible = true;
        } else {
          console.error('Movimiento no encontrado');
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar el movimiento:', err);
      }
    });
  }

  enviarFormulario(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      console.warn('Formulario inválido', this.movimientoForm);
      return;
    }

    const formValue = this.movimientoForm.value;

    if (this.editando && this.movimientoActual) {
      const datos: ActualizarMovimientoFinancieroDTO = {
        tipo_movimiento: formValue.tipo_movimiento,
        tipo_movimiento_id: formValue.tipo_movimiento_id,
        concepto: formValue.concepto,
        monto: formValue.monto,
        metodo_pago: formValue.metodo_pago,
        pago_id: formValue.pago_id,
        fecha_movimiento: formValue.fecha_movimiento,
        descripcion: formValue.descripcion || null,
        comprobante: formValue.comprobante || null,
        usuario_registro_id: formValue.usuario_registro_id
      };
     

      this.movimientoService.actualizarMovimiento(this.movimientoActual.id, datos).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarMovimientos();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
        }
      });
    } else {
      const datos: CrearMovimientoFinancieroDTO = {
        tipo_movimiento: formValue.tipo_movimiento,
        tipo_movimiento_id: formValue.tipo_movimiento_id,
        concepto: formValue.concepto,
        monto: formValue.monto,
        metodo_pago: formValue.metodo_pago,
        pago_id: formValue.pago_id,
        fecha_movimiento: formValue.fecha_movimiento,
        descripcion: formValue.descripcion || null,
        comprobante: formValue.comprobante || null,
        usuario_registro_id: formValue.usuario_registro_id
      };
       console.log('Datos Registro',datos);
      this.movimientoService.crearMovimiento(datos).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarMovimientos();
        },
        error: (err) => {
          console.error('Error al crear:', err);
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.movimientoForm.reset();
  }

  eliminarMovimiento(id: number): void {
    if (confirm('¿Seguro que desea eliminar este movimiento financiero?')) {
      this.movimientoService.eliminarMovimiento(id).subscribe({
        next: () => {
          this.cargarMovimientos();
        },
        error: () => {
          // Manejar error
        }
      });
    }
  }

  get f() {
    return this.movimientoForm.controls;
  }

  tipoMovimientoLabel(tipo: TipoMovimiento): string {
    return tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
  }

  tipoMovimientoClass(tipo: TipoMovimiento): string {
    return tipo === 'ingreso' ? 'text-success' : 'text-danger';
  }

  nombreTipoMovimiento(id: number): string {
    const tipo = this.tipoMovimientoOpciones.find(t => t.id === id);
    return tipo ? tipo.nombre : 'Desconocido';
  }
}