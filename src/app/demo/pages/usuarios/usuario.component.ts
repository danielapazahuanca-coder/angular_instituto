import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  UsuarioService,
  Usuario,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO
} from '../../../services/usuario.service';
import {
  SucursalService,
  Sucursal
} from '../../../services/sucursal.service';
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

   sucursales: Sucursal[] = [];
  usuarioForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    rol: ['secretaria', [Validators.required]],
    sucursal_id: [null],
    activo: [true],
    password: ['', []] 
  });

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,private sucursalService: SucursalService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarSucursales();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res.success ? (res.data as Usuario[]) : [];
        this.cargando = false;
        console.log('usuarios',this.usuarios);
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar usuarios');
      }
    });
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
  abrirModalCrear(): void {
    this.editando = false;
    this.usuarioActual = null;
    this.usuarioForm.reset({
      id: null,
      nombre: '',
      apellido: '',
      email: '',
      rol: 'secretaria',
      sucursal_id: null, 
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
      sucursal_id: usuario.sucursal_id || null, 
      activo: usuario.activo,
      password: '' 
    });
   
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  enviarFormulario(): void {
      console.log('🔍 Estado del formulario:', {
    invalid: this.usuarioForm.invalid,
    errors: this.usuarioForm.errors,
    value: this.usuarioForm.value,
    rol: this.usuarioForm.get('rol')?.value,
    sucursal_id: this.usuarioForm.get('sucursalId')?.value
  });
    if (this.usuarioForm.invalid) {
    console.log('❌ Formulario inválido');
    this.usuarioForm.markAllAsTouched();
    return;
  }
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
        sucursal_id: formValue.rol === 'secretaria' ? formValue.sucursal_id : null,
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
        sucursal_id: formValue.rol === 'secretaria' ? formValue.sucursal_id : null,
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