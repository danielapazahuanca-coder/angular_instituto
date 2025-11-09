// materia.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MateriaService, Materia, CrearMateriaDTO, ActualizarMateriaDTO } from '../../../services/materia.service';

@Component({
  selector: 'app-materia',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './materia.component.html',
  //styleUrls: ['./materia.component.scss']
})
export class MateriaComponent implements OnInit {
  materias: Materia[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  materiaActual: Materia | null = null;

  materiaForm: FormGroup = this.fb.group({
    id: [null],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    creditos: [3, [Validators.required, Validators.min(1)]],
    horas_teoricas: [2, [Validators.min(0)]],
    horas_practicas: [2, [Validators.min(0)]],
    tipo: ['obligatoria', [Validators.required]]
  });

  tiposDisponibles = [
    { value: 'obligatoria', label: 'Obligatoria' },
    { value: 'optativa', label: 'Optativa' },
    { value: 'electiva', label: 'Electiva' }
  ];

  constructor(
    private fb: FormBuilder,
    private materiaService: MateriaService
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.cargando = true;
    this.materiaService.getMaterias().subscribe({
      next: (res) => {
        this.materias = res.success ? (res.data as Materia[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar materias');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.materiaActual = null;
    this.materiaForm.reset({
      id: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      creditos: 3,
      horas_teoricas: 2,
      horas_practicas: 2,
      tipo: 'obligatoria'
    });
    this.modalVisible = true;
  }

  abrirModalEditar(materia: Materia): void {
    this.editando = true;
    this.materiaActual = materia;
    this.materiaForm.patchValue({
      id: materia.id,
      codigo: materia.codigo,
      nombre: materia.nombre,
      descripcion: materia.descripcion || '',
      creditos: materia.creditos,
      horas_teoricas: materia.horas_teoricas,
      horas_practicas: materia.horas_practicas,
      tipo: materia.tipo
    });
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }

    const formValue = this.materiaForm.value;

    const datos: CrearMateriaDTO | ActualizarMateriaDTO = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      creditos: formValue.creditos,
      horas_teoricas: formValue.horas_teoricas !== null ? formValue.horas_teoricas : undefined,
      horas_practicas: formValue.horas_practicas !== null ? formValue.horas_practicas : undefined,
      tipo: formValue.tipo || undefined
    };

    if (this.editando && this.materiaActual) {
      this.materiaService.actualizarMateria(this.materiaActual.id, datos as ActualizarMateriaDTO).subscribe({
        next: () => {
          // this.toastr.success('Materia actualizada');
          this.cerrarModal();
          this.cargarMaterias();
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });
    } else {
      this.materiaService.crearMateria(datos as CrearMateriaDTO).subscribe({
        next: () => {
          // this.toastr.success('Materia creada');
          this.cerrarModal();
          this.cargarMaterias();
        },
        error: () => {
          // this.toastr.error('Error al crear materia');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.materiaForm.reset();
  }

  eliminarMateria(id: number): void {
    if (confirm('¿Seguro que desea desactivar esta materia?')) {
      this.materiaService.eliminarMateria(id).subscribe({
        next: () => {
          // this.toastr.success('Materia desactivada');
          this.cargarMaterias();
        },
        error: () => {
          // this.toastr.error('Error al desactivar');
        }
      });
    }
  }

  get f() {
    return this.materiaForm.controls;
  }
}