// modalidad.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';

import { ModalidadService, Modalidad, CrearModalidadDTO, ActualizarModalidadDTO } from '../../../services/modalidad.service';

@Component({
  selector: 'app-modalidad',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './modalidad.component.html',
  //styleUrls: ['./modalidad.component.scss']
})
export class ModalidadComponent implements OnInit {
  modalidades: Modalidad[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  modalidadActual: Modalidad | null = null;

  modalidadForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    duracion_meses: [null]
  });

  constructor(
    private fb: FormBuilder,
    private modalidadService: ModalidadService
  ) {}

  ngOnInit(): void {
    this.cargarModalidades();
  }

  cargarModalidades(): void {
    this.cargando = true;
    this.modalidadService.getModalidades().subscribe({
      next: (res) => {
        this.modalidades = res.success ? (res.data as Modalidad[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar modalidades');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.modalidadActual = null;
    this.modalidadForm.reset({
      id: null,
      nombre: '',
      descripcion: '',
      duracion_meses: null
    });
    this.modalidadForm.get('nombre')?.setValidators([Validators.required]);
    this.modalidadForm.get('nombre')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  abrirModalEditar(modalidad: Modalidad): void {
    this.editando = true;
    this.modalidadActual = modalidad;
    this.modalidadForm.patchValue({
      id: modalidad.id,
      nombre: modalidad.nombre,
      descripcion: modalidad.descripcion || '',
      duracion_meses: modalidad.duracion_meses
    });
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.modalidadForm.invalid) {
      this.modalidadForm.markAllAsTouched();
      return;
    }

    const formValue = this.modalidadForm.value;

    if (this.editando && this.modalidadActual) {
      const datos: ActualizarModalidadDTO = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        duracion_meses: formValue.duracion_meses !== null ? formValue.duracion_meses : undefined
      };

      this.modalidadService.actualizarModalidad(this.modalidadActual.id, datos).subscribe({
        next: () => {
          // this.toastr.success('Modalidad actualizada');
          this.cerrarModal();
          this.cargarModalidades();
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });
    } else {
      const datos: CrearModalidadDTO = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || undefined,
        duracion_meses: formValue.duracion_meses !== null ? formValue.duracion_meses : undefined
      };

      this.modalidadService.crearModalidad(datos).subscribe({
        next: () => {
          // this.toastr.success('Modalidad creada');
          this.cerrarModal();
          this.cargarModalidades();
        },
        error: () => {
          // this.toastr.error('Error al crear');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.modalidadForm.reset();
  }

  eliminarModalidad(id: number): void {
    if (confirm('¿Seguro que desea desactivar esta modalidad?')) {
      this.modalidadService.eliminarModalidad(id).subscribe({
        next: () => {
          // this.toastr.success('Modalidad desactivada');
          this.cargarModalidades();
        },
        error: () => {
          // this.toastr.error('Error al desactivar');
        }
      });
    }
  }

  get f() {
    return this.modalidadForm.controls;
  }
}