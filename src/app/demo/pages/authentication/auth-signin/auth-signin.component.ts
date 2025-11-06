// src/app/demo/pages/authentication/auth-signin/auth-signin.component.ts

import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent {

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    const email = this.emailInput.nativeElement.value.trim();
    const password = this.passwordInput.nativeElement.value.trim();
    console.log('entra');
    // Validación básica
    if (!email || !password) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña.';
      console.log('errore de datos ',this.errorMessage);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Por favor, ingresa un correo válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.authService.setUserData(response.data);
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = response.message || 'Credenciales inválidas';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al conectar con el servidor';
        this.isLoading = false;
      }
    });
  }
}