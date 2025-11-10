import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
//import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-estudiante',
  templateUrl: './estudiante.component.html',
  styleUrls: ['./estudiante.component.css'],
  standalone: true, 
  imports: [CommonModule]
})
export class EstudianteComponent {
  currentStep = 1;
  studentType = '';
  selectedCareer = '';
  selectedGroups: any[] = [];
  showScheduleConflict = false;

  careers = [
    { id: 1, name: 'Ingeniería de Sistemas', duration: 10, code: 'IS-001' },
    { id: 2, name: 'Contabilidad', duration: 8, code: 'CONT-001' },
    { id: 3, name: 'Administración de Empresas', duration: 8, code: 'ADM-001' }
  ];

  availableGroups = [
    {
      id: 1,
      code: 'MAT-101-A',
      subject: 'Matemáticas I',
      professor: 'Dr. Juan Pérez',
      schedule: 'Lun/Mié 08:00-10:00',
      room: 'Aula 201',
      modality: 'Presencial',
      enrolled: 28,
      capacity: 30,
      cost: 350
    },
    {
      id: 2,
      code: 'PROG-101-A',
      subject: 'Programación I',
      professor: 'Lic. María García',
      schedule: 'Mar/Jue 14:00-16:00',
      room: 'Lab 101',
      modality: 'Híbrida',
      enrolled: 25,
      capacity: 30,
      cost: 400
    },
    {
      id: 3,
      code: 'FIS-101-B',
      subject: 'Física I',
      professor: 'Ing. Carlos López',
      schedule: 'Lun/Mié 14:00-16:00',
      room: 'Aula 305',
      modality: 'Presencial',
      enrolled: 29,
      capacity: 30,
      cost: 380
    },
    {
      id: 4,
      code: 'ING-101-A',
      subject: 'Inglés Técnico I',
      professor: 'Prof. Ana Martínez',
      schedule: 'Vie 08:00-12:00',
      room: 'Aula 102',
      modality: 'Virtual',
      enrolled: 20,
      capacity: 25,
      cost: 300
    }
  ];

  steps = [
    { number: 1, title: 'Datos Personales', icon: 'user' },
    { number: 2, title: 'Información Académica', icon: 'book-open' },
    { number: 3, title: 'Selección de Materias', icon: 'calendar' },
    { number: 4, title: 'Confirmación y Pago', icon: 'credit-card' }
  ];

  toggleGroup(group: any): void {
    const exists = this.selectedGroups.find(g => g.id === group.id);
    if (exists) {
      this.selectedGroups = this.selectedGroups.filter(g => g.id !== group.id);
    } else {
      // Simular conflicto de horario
      if (this.selectedGroups.length > 0 && group.id === 3) {
        this.showScheduleConflict = true;
        setTimeout(() => this.showScheduleConflict = false, 3000);
        return;
      }
      this.selectedGroups.push(group);
    }
  }

    isSelected(groupId: number): boolean {
    return this.selectedGroups.some(g => g.id === groupId);
    }

  getAvailabilityColor(enrolled: number, capacity: number): string {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  }

  get totalCost(): number {
    return this.selectedGroups.reduce((sum, g) => sum + g.cost, 0);
  }

  goToPrevious(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToNext(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    } else {
      alert('¡Inscripción completada exitosamente! Se ha enviado un correo de confirmación.');
    }
  }

  getStepIcon(stepNumber: number): string {
    if (this.currentStep > stepNumber) return 'check';
    return this.steps.find(s => s.number === stepNumber)?.icon || 'user';
  }
}