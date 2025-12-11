// src/app/demo/pages/cobros-dias/cobros-del-dia.component.ts

import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PagoEstudianteService, CobroDelDia } from '../../../services/pago-estudiante.service'; 
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-cobros-del-dia',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './cobros-del-dia.component.html'
})
export class CobrosDelDiaComponent implements OnInit {
cobrosData: any = null;
  cobros: CobroDelDia[] = [];
  loading = false;
  total = 0;

  constructor(private pagoService: PagoEstudianteService) {}

  ngOnInit(): void {
    this.loadCobrosDelDia();
  }

loadCobrosDelDia(): void {
  this.loading = true;
  this.pagoService.getCobrosDelDia().subscribe({
    next: (response) => {
      console.log('🔍 Respuesta completa del servicio:', response);
      this.cobros = response.data?.cobros || []; 
      this.total = response.data?.total || 0;
      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Error al llamar al servicio:', error);
      this.loading = false;
      alert('Error en la llamada. Revisa la consola.');
    }
  });
}

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pago pendiente': return 'estado-pendiente';
      case 'Pago vencido': return 'estado-vencido';
      case 'Pagado': return 'estado-pagado';
      default: return 'estado-otro';
    }
  }
}