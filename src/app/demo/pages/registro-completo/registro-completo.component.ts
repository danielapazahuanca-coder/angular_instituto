// components/registro-completo/registro-completo.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  RegistroCompletoService,
  Curso,
  RegistroCompletoDTO,
  EstudianteInscrito,Horario
} from '../../../services/registro-completo.service';

@Component({
  selector: 'app-registro-completo',
  templateUrl: './registro-completo.component.html',
  imports: [SharedModule, ReactiveFormsModule]
})
export class RegistroCompletoComponent implements OnInit {
  registroForm: FormGroup;
  cursos: Curso[] = [];
  cargando = false;
  cursoSeleccionado: Curso | null = null;
   horariosDisponibles: Horario[] = [];
  
  modo: 'lista' | 'registro' = 'lista';
  esEdicion = false;
  estudianteEditando: EstudianteInscrito | null = null;
  estudiantesInscritos: EstudianteInscrito[] = [];
  mostrarFormulario = true; 
  
  subtotal = 0;
  montoDescuento = 0;
  montoTotal = 0;
  saldoPendiente = 0;

  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'qr', label: 'QR' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' }
  ];

  tiposPago = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'total', label: 'Total (pago único)' }
  ];

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroCompletoService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({

      nombre: ['', [Validators.required]],
      apellido_paterno: ['', [Validators.required]],
      apellido_materno: [''],
      ci: [''],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]],
      direccion: [''],
      fecha_nacimiento: [''],
      observaciones_estudiante: [''],
      
      curso_id: [null, [Validators.required]],
      horario_id: [null, [Validators.required]],
      fecha_inicio: ['', [Validators.required]],
      fecha_fin_estimada: [''],
      
      monto_inscripcion: [50, [Validators.required, Validators.min(0)]],
      monto_mensual: ['', [Validators.required, Validators.min(0)]],
      duracion_meses: ['', [Validators.required, Validators.min(1)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      tipo_pago: ['mensual', [Validators.required]],
      
      realizaPagoInscripcion: [false],
      pago_inscripcion: [0],
      metodo_pago: ['efectivo'],
      numero_recibo: [''],
      
      observaciones_inscripcion: ['']
    });
  }


  irANuevoRegistro(): void {
    this.esEdicion = false;
    this.estudianteEditando = null;
    this.modo = 'registro';
    this.cargarCursos(); 
    this.limpiarFormulario(); 
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
    
    this.cargarCursos();

    this.cargarDatosEstudiante(estudiante);
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
      horario_id: estudiante.horario_id || null, // ✅ NUEVO
      fecha_inicio: formatearFecha(estudiante.fecha_inicio),
      fecha_fin_estimada: formatearFecha(estudiante.fecha_fin_estimada),
      
      monto_inscripcion: estudiante.monto_inscripcion || 50,
      monto_mensual: estudiante.monto_mensual,
      duracion_meses: estudiante.duracion_meses,
      descuento: estudiante.descuento || 0,
      tipo_pago: estudiante.tipo_pago || 'mensual',
      
      observaciones_inscripcion: estudiante.observaciones_inscripcion || ''
    });

    setTimeout(() => {
      this.calcularMontos();
    }, 100);
  }

  ngOnInit(): void {
    this.cargarCursosConHorarios();
    this.cargarCursos();
    this.configurarCalculosAutomaticos();
    this.cargarEstudiantes();
  }
   cargarCursosConHorarios(): void {
    this.cargando = true;
    this.registroService.getCursosConHorarios().subscribe({
      next: (res) => {
        this.cursos = res.success ? (res.data as Curso[]) : [];
        this.cargando = false;
        
        if (this.cursos.length > 0) {
          console.log('✅ Cursos con horarios cargados:', this.cursos);
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('❌ Error al cargar cursos:', err);
        alert('Error al cargar cursos con horarios');
      }
    });
  }

    cargarCursos(): void {
      this.cargando = true;
      this.registroService.getCursos().subscribe({
        next: (res) => {
          this.cursos = res.success ? (res.data as Curso[]) : [];
          this.cargando = false;
          
          if (this.cursos.length > 0) {
            console.log('Estructura de un curso:', this.cursos[0]);
          }
        },
        error: () => {
          this.cargando = false;
          alert('Error al cargar cursos');
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

  trackByEstudiante(index: number, est: EstudianteInscrito): number {
    return est.estudiante_id;
  }

  onCursoChange(cursoId: number): void {
    if (!cursoId) {
      this.cursoSeleccionado = null;
      this.horariosDisponibles = [];
      this.registroForm.patchValue({ horario_id: null });
      return;
    }

    this.cursoSeleccionado = this.cursos.find(c => c.id === cursoId) || null;
    
    if (this.cursoSeleccionado) {
      // ✅ Cargar horarios del curso seleccionado
      this.horariosDisponibles = this.cursoSeleccionado.horarios || [];
      
      console.log('📅 Horarios disponibles:', this.horariosDisponibles);
      
      // Resetear selección de horario
      this.registroForm.patchValue({ horario_id: null });
      
      // Autocompletar precios y duración
      const precioMensual = parseFloat(this.cursoSeleccionado.precio_mensual) || 0;
      const duracion = this.cursoSeleccionado.duracion_meses || 1;

      this.registroForm.patchValue({
        monto_mensual: precioMensual,
        duracion_meses: duracion
      });

      this.calcularFechaFin();
      this.calcularMontos();
    }
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
    this.montoDescuento = (this.subtotal * descuento) / 100;
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
        // ✅ PREVENIR DOBLE ENVÍO
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
      horario_id: parseInt(formValue.horario_id), // ✅ NUEVO
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin_estimada: formValue.fecha_fin_estimada,
      
      monto_inscripcion: parseFloat(formValue.monto_inscripcion),
      monto_mensual: parseFloat(formValue.monto_mensual),
      duracion_meses: parseInt(formValue.duracion_meses),
      descuento: parseFloat(formValue.descuento || 0),
      tipo_pago: formValue.tipo_pago,
      
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
      horario_id: parseInt(formValue.horario_id), // ✅ NUEVO
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin_estimada: formValue.fecha_fin_estimada,
      
      monto_inscripcion: parseFloat(formValue.monto_inscripcion),
      monto_mensual: parseFloat(formValue.monto_mensual),
      duracion_meses: parseInt(formValue.duracion_meses),
      descuento: parseFloat(formValue.descuento || 0),
      tipo_pago: formValue.tipo_pago,
      
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
        this.estudiantesInscritos = res.success && res.data ? res.data : [];
      },
      error: () => {
        this.cargando = false;
        alert('Error al cargar la lista de estudiantes');
      }
    });
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
}