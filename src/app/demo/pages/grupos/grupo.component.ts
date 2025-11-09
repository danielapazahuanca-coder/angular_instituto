// grupo.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';

// Servicios
import { GrupoService, Grupo, CrearGrupoDTO, ActualizarGrupoDTO } from '../../../services/grupo.service';
import { MateriaService, Materia } from '../../../services/materia.service';
import { PeriodoAcademicoService, PeriodoAcademico } from '../../../services/periodo-academico.service';
import { UsuarioService, Usuario } from '../../../services/usuario.service';

@Component({
  selector: 'app-grupo',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './grupo.component.html',
  //styleUrls: ['./grupo.component.scss']
})
export class GrupoComponent implements OnInit {
  grupos: Grupo[] = [];
  materias: Materia[] = [];
  periodos: PeriodoAcademico[] = [];
  profesores: Usuario[] = [];

  cargando = false;
  modalVisible = false;
  editando = false;
  grupoActual: Grupo | null = null;

  grupoForm: FormGroup = this.fb.group({
    id: [null],
    codigo: ['', [Validators.required]],
    materia_id: [null, [Validators.required]],
    periodo_academico_id: [null, [Validators.required]],
    profesor_id: [null],
    cupo_maximo: [30, [Validators.required, Validators.min(1)]],
    aula: [''],
    horario: ['']
  });

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private materiaService: MateriaService,
    private periodoService: PeriodoAcademicoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    // Cargar listas de apoyo
    this.materiaService.getMaterias().subscribe(res => {
      this.materias = res.success ? (res.data as Materia[]) : [];
    });
    this.periodoService.getPeriodos().subscribe(res => {
      this.periodos = res.success ? (res.data as PeriodoAcademico[]) : [];
    });
    // Solo profesores (rol_id = 3, asumiendo que así los identificas)
this.usuarioService.getUsuarios().subscribe(res => {
  console.log('Respuesta completa:', res);
  console.log('res.data:', res.data);
  console.log('Tipo de res.data:', Array.isArray(res.data));

  if (res.success && Array.isArray(res.data)) {
    const profes = res.data.filter((u: any) => u.rol_id === 3);
    console.log('Profesores encontrados:', profes);
    this.profesores = profes;
  } else {
    this.profesores = [];
  }
});

    // Cargar grupos
    this.grupoService.getGrupos().subscribe({
      next: (res) => {
        this.grupos = res.success ? (res.data as Grupo[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar grupos');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.grupoActual = null;
    this.grupoForm.reset({
      id: null,
      codigo: '',
      materia_id: null,
      periodo_academico_id: null,
      profesor_id: null,
      cupo_maximo: 30,
      aula: '',
      horario: ''
    });
    this.modalVisible = true;
  }

  abrirModalEditar(grupo: Grupo): void {
    this.editando = true;
    this.grupoActual = grupo;
    this.grupoForm.patchValue({
      id: grupo.id,
      codigo: grupo.codigo,
      materia_id: grupo.materia_id,
      periodo_academico_id: grupo.periodo_academico_id,
      profesor_id: grupo.profesor_id,
      cupo_maximo: grupo.cupo_maximo,
      aula: grupo.aula || '',
      horario: grupo.horario || ''
    });
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    const formValue = this.grupoForm.value;

    const datos: CrearGrupoDTO | ActualizarGrupoDTO = {
      codigo: formValue.codigo,
      materia_id: formValue.materia_id,
      periodo_academico_id: formValue.periodo_academico_id,
      profesor_id: formValue.profesor_id || undefined,
      cupo_maximo: formValue.cupo_maximo,
      aula: formValue.aula || undefined,
      horario: formValue.horario || undefined
    };

    if (this.editando && this.grupoActual) {
      this.grupoService.actualizarGrupo(this.grupoActual.id, datos as ActualizarGrupoDTO).subscribe({
        next: () => {
          // this.toastr.success('Grupo actualizado');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });
    } else {
      this.grupoService.crearGrupo(datos as CrearGrupoDTO).subscribe({
        next: () => {
          // this.toastr.success('Grupo creado');
          this.cerrarModal();
          this.cargarDatos();
        },
        error: () => {
          // this.toastr.error('Error al crear grupo');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.grupoForm.reset();
  }

  eliminarGrupo(id: number): void {
    if (confirm('¿Seguro que desea cancelar este grupo?')) {
      this.grupoService.eliminarGrupo(id).subscribe({
        next: () => {
          // this.toastr.success('Grupo cancelado');
          this.cargarDatos();
        },
        error: () => {
          // this.toastr.error('Error al cancelar');
        }
      });
    }
  }

  get f() {
    return this.grupoForm.controls;
  }
}