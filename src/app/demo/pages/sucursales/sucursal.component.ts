import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {
  SucursalService,
  Sucursal,
  CrearSucursalDTO,
  ActualizarSucursalDTO
} from '../../../services/sucursal.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-sucursal',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './sucursal.component.html',
 // styleUrls: ['./sucursal.component.scss']
})
export class SucursalComponent implements OnInit {
  sucursales: Sucursal[] = [];
  cargando = false;
  modalVisible = false;
  editando = false;
  sucursalActual: Sucursal | null = null;
  busqueda = '';

  
  sucursalForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    direccion: ['', [Validators.maxLength(255)]],
    telefono: ['', [Validators.maxLength(20)]],
    ciudad: ['', [Validators.required, Validators.maxLength(100)]],
    activo: [true]
  });

  constructor(
    private fb: FormBuilder,
    private sucursalService: SucursalService
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
  }

  // 🔹 Cargar todas las sucursales
  cargarSucursales(): void {
    this.cargando = true;
    this.sucursalService.getSucursales().subscribe({
      next: (res) => {
        this.sucursales = res.success ? (res.data as Sucursal[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al cargar sucursales');
      }
    });
  }


  abrirModalCrear(): void {
    this.editando = false;
    this.sucursalActual = null;
    this.sucursalForm.reset({
      id: null,
      nombre: '',
      direccion: '',
      telefono: '',
      ciudad: '',
      activo: true
    });
    this.modalVisible = true;
  }


  abrirModalEditar(sucursal: Sucursal): void {
    this.editando = true;
    this.sucursalActual = sucursal;
    this.sucursalForm.patchValue({
      id: sucursal.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion ?? '',
      telefono: sucursal.telefono ?? '',
      ciudad: sucursal.ciudad,
      activo: sucursal.activo
    });
    this.modalVisible = true;
  }


  enviarFormulario(): void {
    if (this.sucursalForm.invalid) {
      this.sucursalForm.markAllAsTouched();
      return;
    }

    const formValue = this.sucursalForm.value;

    if (this.editando && this.sucursalActual) {
      
      const datos: ActualizarSucursalDTO = {
        nombre: formValue.nombre?.trim(),
        direccion: formValue.direccion?.trim() || null,
        telefono: formValue.telefono?.trim() || null,
        ciudad: formValue.ciudad?.trim(),
        activo: formValue.activo
      };

      this.sucursalService.actualizarSucursal(this.sucursalActual.id, datos).subscribe({
        next: (res) => {
          if (res.success) {
            this.cerrarModal();
            this.cargarSucursales();
            // this.toastr.success('Sucursal actualizada');
          }
        },
        error: () => {
          // this.toastr.error('Error al actualizar');
        }
      });

    } else {
      
      const datos: CrearSucursalDTO = {
        nombre: formValue.nombre.trim(),
        direccion: formValue.direccion?.trim() || null,
        telefono: formValue.telefono?.trim() || null,
        ciudad: formValue.ciudad.trim(),
        activo: formValue.activo
      };

      this.sucursalService.crearSucursal(datos).subscribe({
        next: (res) => {
          if (res.success) {
            this.cerrarModal();
            this.cargarSucursales();
            // this.toastr.success('Sucursal creada');
          }
        },
        error: () => {
          // this.toastr.error('Error al crear');
        }
      });
    }
  }


  cerrarModal(): void {
    this.modalVisible = false;
    this.sucursalForm.reset();
  }


  eliminarSucursal(id: number): void {
    if (confirm('¿Seguro que desea desactivar esta sucursal?')) {
      this.sucursalService.eliminarSucursal(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.cargarSucursales();
            // this.toastr.success('Sucursal desactivada');
          }
        },
        error: () => {
          // this.toastr.error('Error al eliminar');
        }
      });
    }
  }


  buscarPorCiudad(): void {
    if (!this.busqueda.trim()) {
      this.cargarSucursales();
      return;
    }

    this.cargando = true;
    this.sucursalService.getByCiudad(this.busqueda.trim()).subscribe({
      next: (res) => {
        this.sucursales = res.success ? (res.data as Sucursal[]) : [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        // this.toastr.error('Error al buscar');
      }
    });
  }

 
  limpiarBusqueda(): void {
    this.busqueda = '';
    this.cargarSucursales();
  }


  get f() {
    return this.sucursalForm.controls;
  }


  estadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  formatoTelefono(telefono: string | null): string {
    return telefono && telefono.trim() ? telefono : '—';
  }
}