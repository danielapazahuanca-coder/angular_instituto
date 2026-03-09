// curso.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormArray, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  CursoService,
  Curso,
  CrearCursoDTO,
  ActualizarCursoDTO,
  HorarioDTO
} from '../../../services/curso.service';

@Component({
  selector: 'app-curso',
  templateUrl: './curso.component.html',
  imports: [SharedModule, ReactiveFormsModule]
})
export class CursoComponent implements OnInit {
  cursos: Curso[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  cursoActual: Curso | null = null;

  cursoForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required]],
    duracion_meses: [1, [Validators.required]],
    modalidad: ['presencial', [Validators.required]],
    precio_total: [0, [Validators.required, Validators.min(0)]],
    precio_mensual: [0, [Validators.required, Validators.min(0)]],
    descripcion: [''],
    activo: [true],
    horarios: this.fb.array([this.crearHorarioFormGroup()]) 
  });

  duracionOpciones = [
    { value: 1, label: '1 mes' },
    { value: 2, label: '2 meses' },
    { value: 3, label: '3 meses' },
    { value: 4, label: '4 meses' },
    { value: 5, label: '5 meses' },
    { value: 7, label: '7 meses' },
    { value: 12, label: '12 meses (1 año)' },
    { value: 24, label: '24 meses (2 años)' },
    { value: 36, label: '36 meses (3 años)' }
  ];

  modalidadOpciones = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService
  ) {}


  get horarios(): FormArray {
    return this.cursoForm.get('horarios') as FormArray;
  }

  crearHorarioFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      turno: ['', Validators.required],
      hora_inicio: ['', [Validators.required, this.validarHora]],
      hora_fin: ['', [Validators.required, this.validarHora]],
      dias_semana: ['', Validators.required]
    });
  }

  validarHora(control: any) {
    const valor = control.value;
    if (!valor) return null;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(valor) ? null : { formatoHoraInvalido: true };
  }

  ngOnInit(): void {
    this.cargarCursos();

    this.cursoForm.get('precio_total')?.valueChanges.subscribe(() => {
      this.calcularPrecioMensual();
    });

    this.cursoForm.get('duracion_meses')?.valueChanges.subscribe(() => {
      this.calcularPrecioMensual();
    });
  }

    private calcularPrecioMensual(): void {
    const total = this.cursoForm.get('precio_total')?.value || 0;
    const duracion = this.cursoForm.get('duracion_meses')?.value || 1;

    if (duracion > 0) {
      const mensual = total / duracion;
      this.cursoForm.patchValue({
        precio_mensual: Math.round(mensual * 100) / 100
      }, { emitEvent: false }); 
    }
  }

  cargarCursos(): void {
    this.cargando = true;
    this.cursoService.getCursos().subscribe({
      next: (res) => {
        const cursos = res.success ? (res.data as Curso[]) : [];
        this.cursos = cursos.filter(c => Number(c.tipo) === 1);
        this.cargando = false;
        console.log('cursos',this.cursos);
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar cursos');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.cursoActual = null;
    this.cursoForm.reset({
      id: null,
      nombre: '',
      duracion_meses: 1,
      modalidad: 'presencial',
      precio_total: 0,
      precio_mensual: 0,
      descripcion: '',
      activo: true
    });

    this.horarios.clear();
    this.horarios.push(this.crearHorarioFormGroup());
    this.modalVisible = true;
  }

abrirModalEditar(cursoId: number): void {
  this.cargando = true;
  this.cursoService.getCursoById(cursoId).subscribe({
    next: (res) => {
      this.cargando = false;
      if (res.success && res.data) {
        const curso = res.data as Curso;

        console.log(' Curso cargado para edición:', curso);

        this.editando = true;
        this.cursoActual = curso;

        this.cursoForm.patchValue({
          id: curso.id,
          nombre: curso.nombre,
          duracion_meses: curso.duracion_meses,
          modalidad: curso.modalidad,
          precio_total: curso.precio_total,
          precio_mensual: curso.precio_mensual,
          descripcion: curso.descripcion || '',
          activo: curso.activo
        });

        this.horarios.clear();

        if (curso.horarios && curso.horarios.length > 0) {
          curso.horarios.forEach(h => {
            this.horarios.push(this.fb.group({
              id: [h.id],
              turno: [h.turno, Validators.required],
              hora_inicio: [h.hora_inicio, [Validators.required, this.validarHora]],
              hora_fin: [h.hora_fin, [Validators.required, this.validarHora]],
              dias_semana: [h.dias_semana, Validators.required]
            }));
          });
        } else {
          this.horarios.push(this.crearHorarioFormGroup());
        }

        this.modalVisible = true;
      } else {
        console.error(' Curso no encontrado o respuesta inválida');
        // this.toastr.error('Curso no encontrado');
      }
    },
    error: (err) => {
      this.cargando = false;
      console.error(' Error al cargar el curso para edición:', err);
      // this.toastr.error('Error al cargar el curso');
    }
  });
}

  agregarHorario(): void {
    this.horarios.push(this.crearHorarioFormGroup());
  }

  eliminarHorario(index: number): void {
    if (this.horarios.length > 1) {
      this.horarios.removeAt(index);
    }
  }

enviarFormulario(): void {
  console.log(' Iniciando envío del formulario...');

  if (this.cursoForm.invalid) {
    console.warn(' Formulario inválido. Marcando todos los campos como tocados.');
    this.cursoForm.markAllAsTouched();
    this.horarios.markAllAsTouched();

    // Opcional: imprimir qué controles están inválidos
    console.log('Estado del formulario:', this.cursoForm);
    console.log('Horarios inválidos:', this.horarios.controls.map((h, i) => ({
      index: i,
      valid: h.valid,
      errors: h.errors,
      value: h.value
    })));

    return;
  }

  const formValue = this.cursoForm.value;
  console.log(' Formulario válido. Datos a enviar:', formValue);

  if (this.editando && this.cursoActual) {
    console.log(' Modo: actualización de curso (ID:', this.cursoActual.id, ')');

    const datos: ActualizarCursoDTO = {
      nombre: formValue.nombre,
      duracion_meses: formValue.duracion_meses,
      modalidad: formValue.modalidad,
      precio_total: formValue.precio_total,
      precio_mensual: formValue.precio_mensual,
      descripcion: formValue.descripcion || null,
      activo: formValue.activo,
      horarios: formValue.horarios
    };

    console.log(' Enviando datos de actualización:', datos);

    this.cursoService.actualizarCurso(this.cursoActual.id, datos).subscribe({
      next: (response) => {
        console.log(' Respuesta del backend (actualización):', response);
       
        this.cerrarModal();
        this.cargarCursos();
      },  
      error: (error) => {
        console.error(' Error al actualizar curso:', error);
        
      }
    });
  } else {
    console.log('🆕 Modo: creación de nuevo curso');

    const datos: CrearCursoDTO = {
      nombre: formValue.nombre,
      duracion_meses: formValue.duracion_meses,
      modalidad: formValue.modalidad,
      precio_total: formValue.precio_total,
      precio_mensual: formValue.precio_mensual,
      descripcion: formValue.descripcion || undefined,
      tipo: 1,
      activo: formValue.activo,
      horarios: formValue.horarios
    };

    console.log(' Enviando datos de creación:', datos);

    this.cursoService.crearCurso(datos).subscribe({
      next: (response) => {
        console.log(' Respuesta del backend (creación):', response);
        this.cerrarModal();
        this.cargarCursos();
      },
      error: (error) => {
        console.error(' Error al crear curso:', error);
      }
    });
  }
}

  cerrarModal(): void {
    this.modalVisible = false;
    this.cursoForm.reset();
  }

  eliminarCurso(id: number): void {
    if (confirm('¿Seguro que desea desactivar este curso?')) {
      this.cursoService.eliminarCurso(id).subscribe({
        next: () => {
          // this.toastr.success('Curso desactivado');
          this.cargarCursos();
        },
        error: () => {
          // this.toastr.error('Error al desactivar');
        }
      });
    }
  }

  get f() {
    return this.cursoForm.controls;
  }

  estadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}