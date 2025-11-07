import { Component,OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UsuarioService, Usuario,CrearUsuarioDTO,ActualizarUsuarioDTO } from '../../../services/usuario.service';
import { FormBuilder,ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tbl-bootstrap',
  imports: [SharedModule,ReactiveFormsModule],
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
    rol_id: [1, [Validators.required]],
    nombre: ['', [Validators.required]],
    apellido_paterno: ['', [Validators.required]],
    apellido_materno: [''],
    ci: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    password: ['', this.editando ? [] : [Validators.required]] 
  });

    constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
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
      //  this.toastr.error('Error al cargar usuarios');
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.usuarioActual = null;
    this.usuarioForm.reset({
      id: null,
      rol_id: 1,
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      ci: '',
      email: '',
      telefono: '',
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
      rol_id: usuario.rol_id,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      ci: usuario.ci,
      email: usuario.email,
      telefono: usuario.telefono,
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
        rol_id: formValue.rol_id,
        nombre: formValue.nombre,
        apellido_paterno: formValue.apellido_paterno,
        apellido_materno: formValue.apellido_materno,
        ci: formValue.ci,
        email: formValue.email,
        telefono: formValue.telefono,
        password: formValue.password || undefined 
      };
      this.usuarioService.actualizarUsuario(this.usuarioActual.id, datos).subscribe({
        next: () => {
          //this.toastr.success('Usuario actualizado');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => {
          //this.toastr.error('Error al actualizar');
        }
      });
    } else {
      const datos: CrearUsuarioDTO = {
        rol_id: formValue.rol_id,
        nombre: formValue.nombre,
        apellido_paterno: formValue.apellido_paterno,
        apellido_materno: formValue.apellido_materno,
        ci: formValue.ci,
        email: formValue.email,
        telefono: formValue.telefono,
        password: formValue.password
      };
      this.usuarioService.crearUsuario(datos).subscribe({
        next: () => {
         // this.toastr.success('Usuario creado');
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: () => {
          //this.toastr.error('Error al crear usuario');
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.usuarioForm.reset();
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Seguro que desea eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
         // this.toastr.success('Usuario eliminado');
          this.cargarUsuarios();
        },
        error: () => {
        //  this.toastr.error('Error al eliminar');
        }
      });
    }
  }

  get f() {
    return this.usuarioForm.controls;
  }
}