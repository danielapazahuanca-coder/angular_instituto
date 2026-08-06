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
import { AuthService } from '../../../services/auth.service';

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
  usuarioActual: any = null;
  sucursalUsuario: number | null = null;
  rolUsuario: string | null = null;
  usuarioIdActual: number | null = null;

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
    private usuarioService: UsuarioService,
    private sucursalService: SucursalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioActual = user;
      this.usuarioIdActual = user.id;
      this.sucursalUsuario = user.sucursal_id;
      this.rolUsuario = user.rol;
      
      console.log('📝 ID del usuario logueado:', this.usuarioIdActual);
      console.log('🏢 ID de la sucursal del usuario logueado:', this.sucursalUsuario);
      console.log('👤 Rol del usuario logueado:', this.rolUsuario);
    }
    
    this.cargarUsuarios();
    this.cargarSucursales();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => {
        let todosUsuarios = res.success ? (res.data as Usuario[]) : [];
        
        if (this.rolUsuario === 'secretaria') {
          this.usuarios = todosUsuarios.filter(u => u.id === this.usuarioIdActual);
        } else {
          this.usuarios = todosUsuarios;
        }
        
        this.cargando = false;
        console.log('usuarios', this.usuarios);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarSucursales(): void {
    this.cargando = true;
    this.sucursalService.getSucursales().subscribe({
      next: (res) => {
        this.sucursales = res.success ? (res.data as Sucursal[]) : [];
        this.cargando = false;
        console.log('Sucursales', this.sucursales);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  puedeEditar(usuario: Usuario): boolean {
    if (this.rolUsuario === 'admin') {
      return true; 
    }

    return this.rolUsuario === 'secretaria' && usuario.id === this.usuarioIdActual;
  }

  puedeEliminar(usuario: Usuario): boolean {

    return this.rolUsuario === 'admin';
  }

  puedeAgregar(): boolean {
    
    return this.rolUsuario === 'admin';
  }

  abrirModalCrear(): void {
   
    if (!this.puedeAgregar()) {
      alert('No tienes permisos para agregar usuarios');
      return;
    }

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
    
    this.habilitarCampos(true);
    
    this.usuarioForm.get('password')?.setValidators([Validators.required]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }

  abrirModalEditar(usuario: Usuario): void {
   
    if (!this.puedeEditar(usuario)) {
      alert('No tienes permisos para editar este usuario');
      return;
    }

    this.editando = true;
    this.usuarioActual = usuario;
    
    const esAdmin = this.rolUsuario === 'admin';
    const esSecretariaPropia = this.rolUsuario === 'secretaria' && usuario.id === this.usuarioIdActual;
    
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
    
    if (esAdmin) {
      
      this.habilitarCampos(true);
    } else if (esSecretariaPropia) {
 
      this.habilitarCampos(false);
      // Deshabilitar todos los campos excepto contraseña
      this.usuarioForm.get('nombre')?.disable();
      this.usuarioForm.get('apellido')?.disable();
      this.usuarioForm.get('email')?.disable();
      this.usuarioForm.get('rol')?.disable();
      this.usuarioForm.get('sucursal_id')?.disable();
      this.usuarioForm.get('activo')?.disable();
      this.usuarioForm.get('password')?.enable();
    }
    
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.modalVisible = true;
  }


  habilitarCampos(habilitado: boolean): void {
    const controls = ['nombre', 'apellido', 'email', 'rol', 'sucursal_id', 'activo', 'password'];
    controls.forEach(control => {
      if (habilitado) {
        this.usuarioForm.get(control)?.enable();
      } else {
        this.usuarioForm.get(control)?.disable();
      }
    });
  }

  enviarFormulario(): void {
  
    if (this.usuarioForm.invalid) {
      console.log('❌ Formulario inválido');
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.usuarioForm.getRawValue(); 

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
    
    this.habilitarCampos(true);
  }

  eliminarUsuario(id: number): void {
    
    if (!this.puedeEliminar({ id } as Usuario)) {
      alert('No tienes permisos para eliminar usuarios');
      return;
    }

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