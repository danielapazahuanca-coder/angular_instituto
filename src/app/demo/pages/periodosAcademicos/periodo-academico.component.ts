// periodo-academico.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  PeriodoAcademicoService,
  PeriodoAcademico,
  CrearPeriodoAcademicoDTO,
  ActualizarPeriodoAcademicoDTO
} from '../../../services/periodo-academico.service';

@Component({
  selector: 'app-periodo-academico',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './periodo-academico.component.html',
  //styleUrls: ['./periodo-academico.component.scss']
})
export class PeriodoAcademicoComponent implements OnInit {
  periodos: PeriodoAcademico[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  periodoActual: PeriodoAcademico | null = null;

  periodoForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    tipo: ['semestre', [Validators.required]],
    fecha_inicio: ['', [Validators.required]],
    fecha_fin: ['', [Validators.required]],
    fecha_inicio_inscripciones: [''],
    fecha_fin_inscripciones: ['']
  });

  tiposDisponibles = [
    { value: 'semestre', label: 'Semestre' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'cuatrimestre', label: 'Cuatrimestre' },
    { value: 'anual', label: 'Anual' }
  ];

  constructor(
    private fb: FormBuilder,
    private periodoService: PeriodoAcademicoService
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
  }

  cargarPeriodos(): void {
    this.cargando = true;
    this.periodoService.getPeriodos().subscribe({
      next: (res) => {
        this.periodos = res.success ? (res.data as PeriodoAcademico[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar periodos');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.periodoActual = null;
    const anioActual = new Date().getFullYear();
    this.periodoForm.reset({
      id: null,
      nombre: '',
      anio: anioActual,
      tipo: 'semestre',
      fecha_inicio: '',
      fecha_fin: '',
      fecha_inicio_inscripciones: '',
      fecha_fin_inscripciones: ''
    });
    this.modalVisible = true;
  }

  abrirModalEditar(periodo: PeriodoAcademico): void {
    this.editando = true;
    this.periodoActual = periodo;
    this.periodoForm.patchValue({
      id: periodo.id,
      nombre: periodo.nombre,
      anio: periodo.anio,
      tipo: periodo.tipo,
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      fecha_inicio_inscripciones: periodo.fecha_inicio_inscripciones || '',
      fecha_fin_inscripciones: periodo.fecha_fin_inscripciones || ''
    });
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.periodoForm.invalid) {
      this.periodoForm.markAllAsTouched();
      return;
    }

    const formValue = this.periodoForm.value;

    const datos: CrearPeriodoAcademicoDTO | ActualizarPeriodoAcademicoDTO = {
      nombre: formValue.nombre,
      anio: formValue.anio,
      tipo: formValue.tipo,
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin: formValue.fecha_fin,
      fecha_inicio_inscripciones: formValue.fecha_inicio_inscripciones || undefined,
      fecha_fin_inscripciones: formValue.fecha_fin_inscripciones || undefined
    };

    if (this.editando && this.periodoActual) {
      this.periodoService.actualizarPeriodo(this.periodoActual.id, datos as ActualizarPeriodoAcademicoDTO).subscribe({
        next: () => {
          // this.toastr.success('Periodo actualizado');
          this.cerrarModal();
          this.cargarPeriodos();
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });
    } else {
      this.periodoService.crearPeriodo(datos as CrearPeriodoAcademicoDTO).subscribe({
        next: () => {
          // this.toastr.success('Periodo creado');
          this.cerrarModal();
          this.cargarPeriodos();
        },
        error: () => {
          // this.toastr.error('Error al crear periodo');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.periodoForm.reset();
  }

  eliminarPeriodo(id: number): void {
    if (confirm('¿Seguro que desea finalizar este periodo académico?')) {
      this.periodoService.eliminarPeriodo(id).subscribe({
        next: () => {
          // this.toastr.success('Periodo finalizado');
          this.cargarPeriodos();
        },
        error: () => {
          // this.toastr.error('Error al finalizar');
        }
      });
    }
  }

  get f() {
    return this.periodoForm.controls;
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString();
  }
}