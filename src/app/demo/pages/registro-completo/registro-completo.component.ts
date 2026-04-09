// components/registro-completo/registro-completo.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ComprobantePagoComponent, DatosComprobante } from './comprobante-pago/comprobante-pago.component';
import {
  RegistroCompletoService,
  Curso,
  RegistroCompletoDTO,
  EstudianteInscrito,Horario
} from '../../../services/registro-completo.service';
import {
  SucursalService,
  Sucursal
} from '../../../services/sucursal.service';

@Component({
  selector: 'app-registro-completo',
  templateUrl: './registro-completo.component.html',
  imports: [SharedModule, ReactiveFormsModule, ComprobantePagoComponent]
})
export class RegistroCompletoComponent implements OnInit {
  registroForm: FormGroup;
  cursos: Curso[] = [];
  cargando = false;
  cursoSeleccionado: Curso | null = null;
   horariosDisponibles: Horario[] = [];
   cursosFiltrados: Curso[] = []; 
   sucursales: Sucursal[] = [];
     
  modo: 'lista' | 'registro' = 'lista';
  esEdicion = false;
  estudianteEditando: EstudianteInscrito | null = null;
  estudiantesInscritos: EstudianteInscrito[] = [];
  estudiantesFiltrados: EstudianteInscrito[] = [];
  mostrarFormulario = true; 
  
  comprobanteDatos: DatosComprobante | null = null;
  mostrarComprobante: boolean = false;       
  estudianteSeleccionado: any = null;      
  deudas: any[] = []; 
   // Variables para filtros
  filtroCursoId: number | null = null;
  filtroHorarioId: number | null = null;
  filtroNombre: string = '';
  filtroCI: string = '';
  
  subtotal = 0;
  montoDescuento = 0;
  montoTotal = 0;
  saldoPendiente = 0;

  estadosEstudiante = [
    { value: 'activo', label: 'Activo', class: 'bg-success' },
    { value: 'inactivo', label: 'Inactivo', class: 'bg-secondary' },
    { value: 'suspendido', label: 'Suspendido', class: 'bg-warning' },
    { value: 'congelado', label: 'Congelado', class: 'bg-warning' },
    { value: 'egresado', label: 'Egresado', class: 'bg-info' }
  ];

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

  tiposPago = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'total', label: 'Total (pago único)' }
  ];

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroCompletoService,private sucursalService: SucursalService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({

      nombre: ['', [Validators.required]],
      apellido_paterno: ['', [Validators.required]],
      apellido_materno: [''],
      ci: [''],
      telefono: [''],
      email: [''],
      direccion: [''],
      fecha_nacimiento: [''],
      observaciones_estudiante: [''],
      
      tipo_formacion: [null, [Validators.required]],

      curso_id: [null, [Validators.required]],
      horario_id: [null, [Validators.required]],
      fecha_inicio: ['', [Validators.required]],
      fecha_fin_estimada: [''],
      
      monto_inscripcion: [50, [Validators.required, Validators.min(0)]],
      monto_reserva: [[Validators.required, Validators.min(0)]],
      monto_mensual: ['', [Validators.required, Validators.min(0)]],
      duracion_meses: ['', [Validators.required, Validators.min(1)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      tipo_pago: ['mensual', [Validators.required]],
      
      realizaPagoInscripcion: [false],
      pago_inscripcion: [0],
      metodo_pago: ['efectivo', [Validators.required]],
      numero_recibo: [''],
      estado: [ [Validators.required]], 
      sucursal_id: null,
      
      observaciones_inscripcion: ['']
    });
  }


  irANuevoRegistro(): void {
    this.esEdicion = false;
    this.estudianteEditando = null;
    this.modo = 'registro';
    //this.cargarCursos(); 
    this.limpiarFormulario(); 
  }
   cargarSucursales(): void {
    this.cargando = true;
    this.sucursalService.getSucursales().subscribe({
      next: (res) => {
        this.sucursales = res.success ? (res.data as Sucursal[]) : [];
        this.cargando = false;
        console.log('Sucursales',this.sucursales);
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar sucursales');
      }
    });
  }
  volverALista(): void {
    this.esEdicion = false;
    this.estudianteEditando = null;
    this.modo = 'lista';
    this.cargarEstudiantes(); 
  }

  editarEstudiante(estudiante: EstudianteInscrito): void {
    this.esEdicion = true;
    this.estudianteEditando = estudiante;
    this.modo = 'registro';
    
   // this.cargarCursos();

    this.cargarDatosEstudiante(estudiante);
  }

 
filtrarCursos(): void {
  const tipoSeleccionado = this.registroForm.get('tipo_formacion')?.value;
  
  
  this.registroForm.patchValue({ curso_id: null, horario_id: null });
  this.cursoSeleccionado = null;
  this.horariosDisponibles = [];
  
  if (!tipoSeleccionado) {
    this.cursosFiltrados = [];
    return;
  }
  
  
  this.cursosFiltrados = this.cursos.filter(curso => curso.tipo === tipoSeleccionado);
  
  console.log(`🔍 Filtrando por tipo ${tipoSeleccionado}:`, this.cursosFiltrados);
}
cargarDatosEstudiante(estudiante: EstudianteInscrito): void {
    const formatearFecha = (fecha: string | null): string => {
      if (!fecha) return '';
      const d = new Date(fecha);
      return d.toISOString().split('T')[0];
    };

    this.registroForm.patchValue({
      nombre: estudiante.nombre,
      apellido_paterno: estudiante.apellido_paterno,
      apellido_materno: estudiante.apellido_materno || '',
      ci: estudiante.ci || '',
      telefono: estudiante.telefono || '',
      email: estudiante.email,
      direccion: estudiante.direccion || '',
      fecha_nacimiento: formatearFecha(estudiante.fecha_nacimiento),
      observaciones_estudiante: estudiante.observaciones_estudiante || '',
      
      curso_id: estudiante.curso_id,
      horario_id: estudiante.horario_id || null,
      fecha_inicio: formatearFecha(estudiante.fecha_inicio),
      fecha_fin_estimada: formatearFecha(estudiante.fecha_fin_estimada),
      
      monto_inscripcion: estudiante.monto_inscripcion || 50,
    
      monto_mensual: estudiante.monto_mensual,
      duracion_meses: estudiante.duracion_meses,
      descuento: estudiante.descuento || 0,
      tipo_pago: estudiante.tipo_pago || 'mensual',
      estado: estudiante.estado,
      
      observaciones_inscripcion: estudiante.observaciones_inscripcion || ''
    });
    console.log('Estudiantes:', this.registroForm);

  const cursoCargado = this.cursos.find(c => c.id === estudiante.curso_id);
  if (cursoCargado) {
    this.registroForm.patchValue({ 
      tipo_formacion: cursoCargado.tipo 
    }, { emitEvent: false }); 
    
    
    this.cursosFiltrados = this.cursos.filter(c => c.tipo === cursoCargado.tipo);
  }

    setTimeout(() => {
      this.onCursoChange(estudiante.curso_id);
      this.calcularMontos();
    }, 100);
  }

  ngOnInit(): void {
    this.cargarCursosConHorarios();
    //this.cargarCursos();
    this.configurarCalculosAutomaticos();
    this.cargarEstudiantes();
    this.cargarSucursales();

    this.registroForm.get('tipo_formacion')?.valueChanges.subscribe(() => {
    this.filtrarCursos();
  });
  }
  
  aplicarFiltros(): void {
  this.estudiantesFiltrados = this.estudiantesInscritos.filter(estudiante => {
    let cumpleFiltros = true;

   
    if (this.filtroCursoId !== null && this.filtroCursoId !== undefined) {
      const cursoId = typeof this.filtroCursoId === 'string' ? 
                      parseInt(this.filtroCursoId) : 
                      this.filtroCursoId;
      cumpleFiltros = cumpleFiltros && estudiante.curso_id === cursoId;
    }

    
    if (this.filtroHorarioId !== null && this.filtroHorarioId !== undefined) {
      const horarioId = typeof this.filtroHorarioId === 'string' ? 
                        parseInt(this.filtroHorarioId) : 
                        this.filtroHorarioId;
      cumpleFiltros = cumpleFiltros && estudiante.horario_id === horarioId;
    }

      
      if (this.filtroNombre && this.filtroNombre.trim()) {
        const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno || ''}`.toLowerCase();
        cumpleFiltros = cumpleFiltros && nombreCompleto.includes(this.filtroNombre.toLowerCase());
      }

  

    if (this.filtroCI && this.filtroCI.trim()) {
      const ci = (estudiante.ci ?? '').toString().toLowerCase();
      const filtro = this.filtroCI.toLowerCase();
      cumpleFiltros = cumpleFiltros && ci.includes(filtro);
    }

      return cumpleFiltros;
    });
  }


formatoDuracion(meses: number): string {
  if (!meses || meses <= 0) return '0 meses';
  
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  let texto = '';
  
  if (anios > 0) {
    texto += `${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
  
  if (mesesRestantes > 0) {
    if (texto.length > 0) texto += ' y ';
    texto += `${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
  }
  
  return texto;
}

  
  limpiarFiltros(): void {
    this.filtroCursoId = null;
    this.filtroHorarioId = null;
    this.filtroNombre = '';
    this.filtroCI = '';
    this.aplicarFiltros();
  }
  cargarCursosConHorarios(): void {
    this.cargando = true;
    this.registroService.getCursosConHorarios().subscribe({
      next: (res) => {
        this.cursos = res.success ? (res.data as Curso[]) : [];
        this.cursosFiltrados = [];
        this.cargando = false;
        
        console.log('✅ Cursos con horarios cargados:', this.cursos);
        
       
        if (this.cursos.length > 0) {
          this.cursos.forEach(curso => {
            console.log(`Curso: ${curso.nombre}, Horarios:`, curso.horarios);
          });
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('❌ Error al cargar cursos:', err);
        alert('Error al cargar cursos con horarios');
      }
    });
  }


  irAlFormulario(): void {
    this.mostrarFormulario = true;
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
  }

  configurarCalculosAutomaticos(): void {
    this.registroForm.get('monto_inscripcion')?.valueChanges.subscribe(() => this.calcularMontos());
    this.registroForm.get('monto_mensual')?.valueChanges.subscribe(() => this.calcularMontos());
    this.registroForm.get('duracion_meses')?.valueChanges.subscribe(() => this.calcularMontos());
    this.registroForm.get('descuento')?.valueChanges.subscribe(() => this.calcularMontos());
    this.registroForm.get('pago_inscripcion')?.valueChanges.subscribe(() => this.calcularMontos());
    
    this.registroForm.get('curso_id')?.valueChanges.subscribe((cursoId) => {
      this.onCursoChange(cursoId);
    });
    
    this.registroForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.calcularFechaFin();
    });
    
    this.registroForm.get('realizaPagoInscripcion')?.valueChanges.subscribe((realiza) => {
      this.onRealizaPagoChange(realiza);
    });
  }
    trackByHorario(index: number, horario: Horario): number {
    return horario.id;
  }

  trackByEstudiante(index: number, est: EstudianteInscrito): number {
    return est.estudiante_id;
  }

  onCursoChange(cursoId: number): void {
    console.log('🔍 Curso seleccionado ID:', cursoId);
    
    if (!cursoId) {
      this.cursoSeleccionado = null;
      this.horariosDisponibles = [];
      this.registroForm.patchValue({ horario_id: null });
      return;
    }

    this.cursoSeleccionado = this.cursos.find(c => c.id === cursoId) || null;
    
    if (this.cursoSeleccionado) {
      
      this.horariosDisponibles = this.cursoSeleccionado.horarios || [];
      
      console.log('📅 Horarios disponibles:', this.horariosDisponibles);
      console.log('📅 Cantidad de horarios:', this.horariosDisponibles.length);
      
      
      if (!this.esEdicion) {
        this.registroForm.patchValue({ horario_id: null });
      }
      
  
      const precioMensual = parseFloat(this.cursoSeleccionado.precio_mensual || '0') || 0;
      const duracion = this.cursoSeleccionado.duracion_meses || 1;

      this.registroForm.patchValue({
        monto_mensual: precioMensual,
        duracion_meses: duracion
      });

      this.calcularFechaFin();
      this.calcularMontos();
    } else {
      console.warn('⚠️ No se encontró el curso seleccionado');
      this.horariosDisponibles = [];
    }
  }

  
seleccionarHorario(horarioId: number): void {
  this.registroForm.get('horario_id')?.setValue(horarioId);
}

  calcularFechaFin(): void {
    const fechaInicio = this.registroForm.get('fecha_inicio')?.value;
    const duracionMeses = this.registroForm.get('duracion_meses')?.value;
    
    if (fechaInicio && duracionMeses) {
      const fecha = new Date(fechaInicio);
      fecha.setMonth(fecha.getMonth() + parseInt(duracionMeses));
      
      const fechaFin = fecha.toISOString().split('T')[0];
      this.registroForm.patchValue({ fecha_fin_estimada: fechaFin }, { emitEvent: false });
    }
  }

    calcularMontos(): void {
      const montoInscripcion = parseFloat(this.registroForm.get('monto_inscripcion')?.value) || 0;
      const montoMensual = parseFloat(this.registroForm.get('monto_mensual')?.value) || 0;
      const duracionMeses = parseInt(this.registroForm.get('duracion_meses')?.value) || 0;
      
      const descuento = parseFloat(this.registroForm.get('descuento')?.value) || 0;
      
      const pagoInscripcion = parseFloat(this.registroForm.get('pago_inscripcion')?.value) || 0;
      
      this.subtotal = montoInscripcion + (montoMensual * duracionMeses);
      

      this.montoDescuento = descuento; 
      

      if (this.montoDescuento > this.subtotal) {
          this.montoDescuento = this.subtotal;
      }

      this.montoTotal = this.subtotal - this.montoDescuento;
      this.saldoPendiente = this.montoTotal - pagoInscripcion;
    }
  onRealizaPagoChange(realiza: boolean): void {
    const pagoControl = this.registroForm.get('pago_inscripcion');
    const metodoControl = this.registroForm.get('metodo_pago');
    const montoInscripcionCtrl = this.registroForm.get('monto_inscripcion');

    if (realiza) {
      const maxPagoValidator = (control: any) => {
        const montoInscripcion = parseFloat(montoInscripcionCtrl?.value) || 0;
        const pago = parseFloat(control.value) || 0;
        return pago > montoInscripcion 
          ? { excedeMonto: { max: montoInscripcion, actual: pago } } 
          : null;
      };

      pagoControl?.setValidators([
        Validators.required,
        Validators.min(0.01),
        maxPagoValidator
      ]);
      metodoControl?.setValidators([Validators.required]);

      const montoInscripcion = montoInscripcionCtrl?.value || 50;
      pagoControl?.setValue(montoInscripcion);
    } else {
      pagoControl?.clearValidators();
      metodoControl?.clearValidators();
      pagoControl?.setValue(0);
    }

    pagoControl?.updateValueAndValidity();
    metodoControl?.updateValueAndValidity();
  }

    enviarFormulario(): void {
      
        if (this.cargando) {
          console.warn('⚠️ Ya hay un registro en proceso');
          return;
        }

        if (this.registroForm.invalid) {
          this.registroForm.markAllAsTouched();
          alert('Por favor complete todos los campos obligatorios');
          return;
        }

        if (this.esEdicion) {
          this.actualizarEstudiante();
        } else {
          this.registrarEstudiante();
        }
      }

registrarEstudiante(): void {
    this.cargando = true;
    const formValue = this.registroForm.value;

    const metodoPago = formValue.metodo_pago || 'efectivo'; 
    const datos: RegistroCompletoDTO = {
      nombre: formValue.nombre,
      apellido_paterno: formValue.apellido_paterno,
      apellido_materno: formValue.apellido_materno || null,
      ci: formValue.ci || null,
      telefono: formValue.telefono || null,
      email: formValue.email,
      direccion: formValue.direccion || null,
      fecha_nacimiento: formValue.fecha_nacimiento || null,
      observaciones_estudiante: formValue.observaciones_estudiante || null,
      
      curso_id: parseInt(formValue.curso_id),
      horario_id: parseInt(formValue.horario_id), 
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin_estimada: formValue.fecha_fin_estimada,
      
      monto_inscripcion: parseFloat(formValue.monto_inscripcion),
      monto_reserva: parseFloat(formValue.monto_reserva),
      monto_mensual: parseFloat(formValue.monto_mensual),
      duracion_meses: parseInt(formValue.duracion_meses),
      descuento: parseFloat(formValue.descuento || 0),
      tipo_pago: formValue.tipo_pago,
      estado: formValue.estado,
      
      pago_inscripcion: parseFloat(formValue.monto_inscripcion),
      metodo_pago: metodoPago,
      numero_recibo: formValue.realizaPagoInscripcion && formValue.numero_recibo ? formValue.numero_recibo : null,
      
      observaciones_inscripcion: formValue.observaciones_inscripcion || null,
      usuario_registro_id: null
    };
    
    console.log('🔍 Datos que se enviarán al backend:', datos);
    
    this.registroService.registrarEstudianteCompleto(datos).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.success) {
           this.generarComprobante(formValue, res.data);
          alert('¡Registro completado exitosamente!\n\n' +
               `Estudiante ID: ${res.data?.estudiante_id}\n` +
               `Inscripción ID: ${res.data?.inscripcion_id}\n` +
               `Monto Total: Bs. ${res.data?.monto_total.toFixed(2)}\n` +
               `Descuento: ${res.data?.descuento_aplicado}`);
          
          this.volverALista();
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al registrar: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }


actualizarEstudiante(): void {
    if (!this.estudianteEditando) return;

    const formValue = this.registroForm.value;
    
    const datos: RegistroCompletoDTO = {
      nombre: formValue.nombre,
      apellido_paterno: formValue.apellido_paterno,
      apellido_materno: formValue.apellido_materno || null,
      ci: formValue.ci || null,
      telefono: formValue.telefono || null,
      email: formValue.email,
      direccion: formValue.direccion || null,
      fecha_nacimiento: formValue.fecha_nacimiento || null,
      observaciones_estudiante: formValue.observaciones_estudiante || null,
      
      curso_id: parseInt(formValue.curso_id),
      horario_id: parseInt(formValue.horario_id),
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin_estimada: formValue.fecha_fin_estimada,
      
      monto_inscripcion: parseFloat(formValue.monto_inscripcion),
      monto_reserva: parseFloat(formValue.monto_reserva),
      monto_mensual: parseFloat(formValue.monto_mensual),
      duracion_meses: parseInt(formValue.duracion_meses),
      descuento: parseFloat(formValue.descuento || 0),
      tipo_pago: formValue.tipo_pago,
      estado: formValue.estado ,
      
      observaciones_inscripcion: formValue.observaciones_inscripcion || null,
      usuario_registro_id: null
    };
    
    this.cargando = true;
    this.registroService.actualizarEstudiante(this.estudianteEditando.estudiante_id, datos).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.success) {
          alert('¡Estudiante actualizado exitosamente!');
          this.volverALista();
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al actualizar: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }


cargarEstudiantes(): void {
  this.cargando = true;
  this.registroService.getEstudiantesInscritos().subscribe({
    next: (res) => {
      this.cargando = false;
      if (res.success && res.data) {
        
        this.estudiantesInscritos = res.data.map(est => ({
          ...est,
          horario_turno: est.turno,        
          horario_dias: est.dias_semana  
        }));
        console.log('Estudiantes:', this.estudiantesInscritos);
        this.aplicarFiltros();
      } else {
        this.estudiantesInscritos = [];
      }
    },
    error: () => {
      this.cargando = false;
      alert('Error al cargar la lista de estudiantes');
    }
  });
}
getHorariosParaFiltro(): Horario[] {
  if (this.filtroCursoId === null || this.filtroCursoId === undefined) {
    return [];
  }
  

  const cursoId = typeof this.filtroCursoId === 'string' ? 
                  parseInt(this.filtroCursoId) : 
                  this.filtroCursoId;
  
  const curso = this.cursos.find(c => c.id === cursoId);
  return curso?.horarios || [];
}

 
getNombreCurso(cursoId: any): string {
  
  const id = typeof cursoId === 'string' ? parseInt(cursoId) : cursoId;
  
  const curso = this.cursos.find(c => c.id === id);
  return curso ? curso.nombre : 'Curso desconocido';
}
 
  getNombreHorario(horarioId: number): string {
    if (!this.filtroCursoId) return 'Seleccione un curso primero';
    
    const curso = this.cursos.find(c => c.id === this.filtroCursoId);
    const horario = curso?.horarios?.find(h => h.id === horarioId);
    return horario ? `${horario.turno} (${horario.dias_semana})` : 'Horario desconocido';
  }

  limpiarFormulario(): void {
    this.registroForm.reset({
      monto_inscripcion: 50,
      descuento: 0,
      tipo_pago: 'mensual',
      metodo_pago: 'efectivo',
      realizaPagoInscripcion: false,
      pago_inscripcion: 0
    });
    this.cursoSeleccionado = null;
    this.subtotal = 0;
    this.montoDescuento = 0;
    this.montoTotal = 0;
    this.saldoPendiente = 0;
  }

  get f() {
    return this.registroForm.controls;
  }

private generarComprobante(pagoRaw: any, respuestaBackend: any): void {
  const estudiante = this.esEdicion 
    ? this.estudianteEditando 
    : respuestaBackend;

  const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellido_paterno || ''} ${estudiante.apellido_materno || ''}`.trim();
  const curso = this.cursos.find(c => c.id === estudiante.curso_id) || this.cursoSeleccionado;


  const montoInscripcion = parseFloat(estudiante.monto_inscripcion || pagoRaw.monto_inscripcion || this.registroForm.get('monto_inscripcion')?.value || 0);
  const montoReserva = parseFloat(estudiante.monto_reserva || pagoRaw.monto_reserva || this.registroForm.get('monto_reserva')?.value || 0);
  const totalPagado = montoInscripcion + montoReserva;

  this.comprobanteDatos = {
    establecimiento: this.ESTABLECIMIENTO.nombre,
    nit: this.ESTABLECIMIENTO.nit,
    direccion: this.ESTABLECIMIENTO.direccion,
    telefono: this.ESTABLECIMIENTO.telefono,
    
    numero_comprobante: respuestaBackend?.numero_comprobante || `CP-${Date.now()}`,
    fecha_emision: new Date().toISOString(),
    
    estudiante: nombreCompleto || 'Estudiante registrado',
    ci_estudiante: estudiante.ci || 'N/A',
    curso: curso?.nombre || this.registroForm.get('curso_id')?.value?.toString() || 'Curso',
    
    concepto: 'Inscripción y matrícula - ' + (curso?.nombre || 'Curso'),
    
   
    monto_inscripcion: montoInscripcion,
    monto_reserva: montoReserva,
    
   
    monto_total: totalPagado,
    
    metodo_pago: pagoRaw.metodo_pago || this.registroForm.get('metodo_pago')?.value || 'efectivo',
    numero_recibo: pagoRaw.numero_recibo || undefined,
    observaciones: pagoRaw.observaciones_inscripcion || this.registroForm.get('observaciones_inscripcion')?.value || undefined,
    
    usuario_cajero: 'Sistema IBCT',
    firma_digital: respuestaBackend?.qr_code_url || undefined
  };

  this.mostrarComprobante = true;
  
  this.estudianteSeleccionado = {
    nombre_completo: nombreCompleto,
    ci: estudiante.ci,
    curso_nombre: curso?.nombre
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
}