// src/app/demo/pages/authentication/auth-signin/auth-signin.component.ts

import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http'; 

@Component({
  standalone: true,
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class AuthSigninComponent {

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  errorMessage = '';
  isLoading = false;
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    console.log('🔑 Iniciando proceso de login...');
    console.log('📧 Email ingresado:', this.email);
    console.log('🔑 Contraseña ingresada (longitud):', this.password.length);

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña.';
      console.warn('⚠️ Validación fallida: campos vacíos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, ingresa un correo válido.';
      console.warn('⚠️ Validación fallida: email inválido');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('📡 Enviando petición de login al backend...');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend (success):', response);
        if (response.success && response.data) {
          this.authService.setUserData(response.data);
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = response.message || 'Credenciales inválidas';
          console.warn('⚠️ Respuesta del backend sin éxito:', response.message);
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ ERROR DETALLADO EN LA PETICIÓN HTTP:', error);
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar al servidor (CORS, red o backend caído)';
        } else if (error.status === 404) {
          this.errorMessage = 'Endpoint /login no encontrado (404). Verifica la URL del backend.';
        } else if (error.status === 500) {
          this.errorMessage = 'Error interno del servidor (500). Revisa los logs del backend.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = `Error ${error.status}: ${error.message}`;
        }

        console.error('📊 Detalles del error HTTP:');
        console.error('- Status:', error.status);
        console.error('- URL:', error.url);
        console.error('- Mensaje:', error.message);
        console.error('- Error completo:', error.error);
      }
    });
  }

  ngOnInit() {
    this.errorMessage = '';
    console.log('🟢 Componente AuthSignin inicializado');
  }
}