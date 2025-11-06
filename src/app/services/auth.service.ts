// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    rol_id: number;
    nombre: string;
    apellido_paterno: string;
    email: string;
    estado: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/instituto_ibct/api/login';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const body = { email, password };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(this.apiUrl, body, { headers });
  }

  setUserData(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}