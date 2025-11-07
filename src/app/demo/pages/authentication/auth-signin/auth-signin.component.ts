// src/app/demo/pages/authentication/auth-signin/auth-signin.component.ts

import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  email = '';
  password = '';

  onLogin(): void {
    console.log('entra');
    if (!this.email || !this.password) {
    this.errorMessage = 'Por favor, ingresa correo y contraseña.';
    return;
  }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, ingresa un correo válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
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

  ngOnInit() {
  this.errorMessage = '';
  }
}