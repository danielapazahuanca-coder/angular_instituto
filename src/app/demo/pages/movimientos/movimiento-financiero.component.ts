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
import { AuthService } from '../../../services/auth.service';
import {
  SucursalService,
  Sucursal
} from '../../../services/sucursal.service';

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
  usuarioActual: any = null;
  sucursalUsuario: number | null = null;
  rolUsuario: string | null = null;
  usuarioIdActual: number | null = null;
  paginaActual = 1;
  registrosPorPagina = 5;
  movimientosPaginados: MovimientoFinanciero[] = [];
  sucursales: Sucursal[] = [];

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
    usuario_registro_id: [null],
    sucursal_id: [null]
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
    private movimientoService: MovimientoFinancieroService,
    private authService: AuthService,
    private sucursalService: SucursalService
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
    this.cargarTiposMovimiento();
    this.cargarMovimientos();
    this.cargarSucursales();

        this.filtrosForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
    console.log('datos',this.cargarTiposMovimiento);
  }

    cargarSucursales(): void {
      this.cargando = true;
      this.sucursalService.getSucursales().subscribe({
        next: (res) => {
          this.sucursales = res.success ? (res.data as Sucursal[]) : [];
          this.cargando = false;
          console.log('Sucursales', this.sucursales);
        },
        error: () => {
          this.cargando = false;
        }
      });
    }

  cargarTiposMovimiento(): void {
    this.movimientoService.getTiposMovimiento().subscribe({
      next: (res) => {
        this.tipoMovimientoOpciones = res.success ? (res.data as TipoMovimientoDTO[]) : [];
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
      const todos = res.success ? (res.data as MovimientoFinanciero[]) : [];

      this.movimientos = this.rolUsuario === 'admin'
        ? todos
        : todos.filter(m => m.sucursal_id === this.sucursalUsuario);

        this.movimientosFiltrados = [...this.movimientos];
        this.paginaActual = 1;
        this.actualizarPagina();
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

      if (tipo_movimiento && tipo_movimiento !== '') {
        cumpleTipo = movimiento.tipo_movimiento === tipo_movimiento;
      }

      if (fecha_movimiento && fecha_movimiento !== '') {
        const fechaMovimiento = new Date(movimiento.fecha_movimiento).toISOString().split('T')[0];
        cumpleFecha = fechaMovimiento === fecha_movimiento;
      }

      return cumpleTipo && cumpleFecha;
    });

    this.paginaActual = 1;
    this.actualizarPagina();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      tipo_movimiento: '',
      fecha_movimiento: ''
    });
    this.movimientosFiltrados = [...this.movimientos];
    this.paginaActual = 1;
    this.actualizarPagina();
  }

  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.movimientosPaginados = this.movimientosFiltrados.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPagina();
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual + 1);
  }

abrirModalCrear(): void {
  this.editando = false;
  this.movimientoActual = null;
  
  const fechaActual = new Date().toISOString().split('T')[0];
  
  let sucursalId = null;
  if (this.rolUsuario === 'admin') {
    sucursalId = null;
  } else {

    sucursalId = this.sucursalUsuario;
  }
  
  this.movimientoForm.reset({
    id: null,
    tipo_movimiento: 'ingreso',
    tipo_movimiento_id: this.tipoMovimientoOpciones.length ? this.tipoMovimientoOpciones[0].id : null,
    concepto: '',
    monto: 0,
    metodo_pago: 'efectivo',
    pago_id: null,
    fecha_movimiento: fechaActual,
    descripcion: '',
    comprobante: '',
    usuario_registro_id: null,
    sucursal_id: sucursalId
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
          usuario_registro_id: movimiento.usuario_registro_id,
          sucursal_id: movimiento.sucursal_id 
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

  let sucursalId = formValue.sucursal_id;
  if (this.rolUsuario !== 'admin') {
    sucursalId = this.sucursalUsuario;
  }

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
      usuario_registro_id: formValue.usuario_registro_id,
      sucursal_id: sucursalId 
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
      usuario_registro_id: formValue.usuario_registro_id,
      sucursal_id: sucursalId 
    };
    
    console.log('Datos Registro', datos);
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
    get totalPaginas(): number {
    return Math.ceil(this.movimientosFiltrados.length / this.registrosPorPagina) || 1;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  getNombreSucursal(id: number): string {
  const sucursal = this.sucursales.find(s => s.id === id);
  return sucursal ? sucursal.nombre : 'Sin sucursal';
}
}