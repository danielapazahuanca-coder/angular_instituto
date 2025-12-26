// src/app/demo/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MovimientoFinancieroService } from '../../services/movimiento-financiero.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  sales = [
    {
      title: 'Total Ingresos',
      icon: 'icon-arrow-up text-c-green',
      amount: 'Bs 0,00',
      percentage: '100%',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme'
    },
    {
      title: 'Total Egresos',
      icon: 'icon-arrow-down text-c-red',
      amount: 'Bs 0,00',
      percentage: '100%',
      progress: 0,
      design: 'col-md-6',
      progress_bg: 'progress-c-theme2'
    },
    {
      title: 'Ganancia Neta',
      icon: 'icon-arrow-up text-c-green',
      amount: 'Bs 0,00',
      percentage: '100%',
      progress: 0,
      design: 'col-md-12',
      progress_bg: 'progress-c-theme'
    }
  ];

  constructor(private movimientoService: MovimientoFinancieroService) {}

  ngOnInit() {
    this.cargarTotalesFinancieros();
  }

private cargarTotalesFinancieros() {
  this.movimientoService.getTotales().subscribe({
    next: (response) => {
      const data = response.data;

      const max = Math.max(
        data.total_ingresos,
        data.total_egresos,
        Math.abs(data.ganancia_neta)
      ) || 1;

      this.sales = [
        {
          title: 'Total Ingresos',
          icon: 'icon-arrow-up text-c-green',
          amount: `Bs ${data.total_ingresos}`, // ← simple
          percentage: '100%',
          progress: (data.total_ingresos / max) * 100,
          design: 'col-md-6',
          progress_bg: 'progress-c-theme'
        },
        {
          title: 'Total Egresos',
          icon: 'icon-arrow-down text-c-red',
          amount: `Bs ${data.total_egresos}`,
          percentage: '100%',
          progress: (data.total_egresos / max) * 100,
          design: 'col-md-6',
          progress_bg: 'progress-c-theme2'
        },
        {
          title: 'Ganancia Neta',
          icon: data.ganancia_neta >= 0 ? 'icon-arrow-up text-c-green' : 'icon-arrow-down text-c-red',
          amount: `Bs ${data.ganancia_neta}`,
          percentage: '100%',
          progress: (Math.abs(data.ganancia_neta) / max) * 100,
          design: 'col-md-12',
          progress_bg: data.ganancia_neta >= 0 ? 'progress-c-theme' : 'progress-c-theme2'
        }
      ];
    },
    error: (err) => {
      console.error('Error al cargar los totales:', err);
    }
  });
}
}