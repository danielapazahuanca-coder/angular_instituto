// carrera.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CarreraService, Carrera, CrearCarreraDTO, ActualizarCarreraDTO } from '../../../services/carrera.service';
import { ModalidadService, Modalidad } from '../../../services/modalidad.service';

@Component({
  selector: 'app-carrera',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './carrera.component.html',
  //styleUrls: ['./carrera.component.scss']
})
export class CarreraComponent implements OnInit {
  carreras: Carrera[] = [];
  modalidades: Modalidad[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  carreraActual: Carrera | null = null;

  carreraForm: FormGroup = this.fb.group({
    id: [null],
    modalidad_id: [1, [Validators.required]],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    duracion_semestres: [8, [Validators.required, Validators.min(1)]],
    creditos_totales: [null],
    requisitos: [''],
    perfil_egreso: [''],
    campo_laboral: [''],
    costo_inscripcion: [null],
    costo_mensual: [null]
  });

  constructor(
    private fb: FormBuilder,
    private carreraService: CarreraService,
    private modalidadService: ModalidadService
  ) {}

  ngOnInit(): void {
    this.cargarModalidades();
    this.cargarCarreras();
  }

  cargarModalidades(): void {
    this.modalidadService.getModalidades().subscribe({
      next: (res) => {
        this.modalidades = res.success ? (res.data as Modalidad[]) : [];
      },
      error: () => {
        // this.toastr.error('Error al cargar modalidades');
      }
    });
  }

  cargarCarreras(): void {
    this.cargando = true;
    this.carreraService.getCarreras().subscribe({
      next: (res) => {
        this.carreras = res.success ? (res.data as Carrera[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar carreras');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.carreraActual = null;
    this.carreraForm.reset({
      id: null,
      modalidad_id: 1,
      codigo: '',
      nombre: '',
      descripcion: '',
      duracion_semestres: 8,
      creditos_totales: null,
      requisitos: '',
      perfil_egreso: '',
      campo_laboral: '',
      costo_inscripcion: null,
      costo_mensual: null
    });
    this.modalVisible = true;
  }

  abrirModalEditar(carrera: Carrera): void {
    this.editando = true;
    this.carreraActual = carrera;
    this.carreraForm.patchValue({
      id: carrera.id,
      modalidad_id: carrera.modalidad_id,
      codigo: carrera.codigo,
      nombre: carrera.nombre,
      descripcion: carrera.descripcion || '',
      duracion_semestres: carrera.duracion_semestres,
      creditos_totales: carrera.creditos_totales,
      requisitos: carrera.requisitos || '',
      perfil_egreso: carrera.perfil_egreso || '',
      campo_laboral: carrera.campo_laboral || '',
      costo_inscripcion: carrera.costo_inscripcion,
      costo_mensual: carrera.costo_mensual
    });
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.carreraForm.invalid) {
      this.carreraForm.markAllAsTouched();
      return;
    }

    const formValue = this.carreraForm.value;

    const datos: CrearCarreraDTO | ActualizarCarreraDTO = {
      modalidad_id: formValue.modalidad_id,
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      duracion_semestres: formValue.duracion_semestres,
      creditos_totales: formValue.creditos_totales !== null ? formValue.creditos_totales : undefined,
      requisitos: formValue.requisitos || undefined,
      perfil_egreso: formValue.perfil_egreso || undefined,
      campo_laboral: formValue.campo_laboral || undefined,
      costo_inscripcion: formValue.costo_inscripcion !== null ? formValue.costo_inscripcion : undefined,
      costo_mensual: formValue.costo_mensual !== null ? formValue.costo_mensual : undefined
    };

    if (this.editando && this.carreraActual) {
      this.carreraService.actualizarCarrera(this.carreraActual.id, datos as ActualizarCarreraDTO).subscribe({
        next: () => {
          // this.toastr.success('Carrera actualizada');
          this.cerrarModal();
          this.cargarCarreras();
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });
    } else {
      this.carreraService.crearCarrera(datos as CrearCarreraDTO).subscribe({
        next: () => {
          // this.toastr.success('Carrera creada');
          this.cerrarModal();
          this.cargarCarreras();
        },
        error: () => {
          // this.toastr.error('Error al crear carrera');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.carreraForm.reset();
  }

  eliminarCarrera(id: number): void {
    if (confirm('¿Seguro que desea desactivar esta carrera?')) {
      this.carreraService.eliminarCarrera(id).subscribe({
        next: () => {
          // this.toastr.success('Carrera desactivada');
          this.cargarCarreras();
        },
        error: () => {
          // this.toastr.error('Error al desactivar');
        }
      });
    }
  }

  get f() {
    return this.carreraForm.controls;
  }

  // Método para obtener nombre de modalidad por ID (usado en la tabla)
  getModalidadNombre(id: number): string {
    const modalidad = this.modalidades.find(m => m.id === id);
    return modalidad ? modalidad.nombre : '—';
  }
}