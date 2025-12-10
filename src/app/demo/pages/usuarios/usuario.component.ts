import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  UsuarioService,
  Usuario,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO
} from '../../../services/usuario.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-tbl-bootstrap',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  usuarioActual: Usuario | null = null;

  usuarioForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    rol: ['secretaria', [Validators.required]],
    activo: [true],
    password: ['', []] 
  });

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res.success ? (res.data as Usuario[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar usuarios');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.usuarioActual = null;
    this.usuarioForm.reset({
      id: null,
      nombre: '',
      apellido: '',
      email: '',
      rol: 'secretaria',
      activo: true,
      password: ''
    });
    
    this.usuarioForm.get('password')?.setValidators([Validators.required]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.editando = true;
    this.usuarioActual = usuario;
    this.usuarioForm.patchValue({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
      password: '' 
    });
   
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  enviarFormulario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.usuarioForm.value;

    if (this.editando && this.usuarioActual) {
      const datos: ActualizarUsuarioDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        rol: formValue.rol,
        activo: formValue.activo,
        password: formValue.password || undefined 
      };

      this.usuarioService.actualizarUsuario(this.usuarioActual.id, datos).subscribe({
        next: () => {
         
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => {
          
        }
      });
    } else {
      const datos: CrearUsuarioDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        rol: formValue.rol,
        password: formValue.password,
        activo: formValue.activo
      };

      this.usuarioService.crearUsuario(datos).subscribe({
        next: () => {
          
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => {
         
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.usuarioForm.reset();
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Seguro que desea desactivar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
         
          this.cargarUsuarios();
        },
        error: () => {
          
        }
      });
    }
  }

  get f() {
    return this.usuarioForm.controls;
  }

  estadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  nombreCompleto(usuario: Usuario): string {
    return `${usuario.nombre} ${usuario.apellido}`;
  }
}