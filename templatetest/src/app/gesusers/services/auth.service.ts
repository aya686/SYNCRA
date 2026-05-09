import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ✅ URL de base (localhost pour le développement)
  private readonly baseUrl = 'http://localhost:8082';
  private readonly apiUrl = `${this.baseUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      // ✅ Gestion des erreurs 400 pour récupérer le message
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error) {
          // Transformer l'erreur 400 en une réponse normale avec success=false
          return throwError(() => error.error);
        }
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/users`, userData);
  }

  completeProfile(profileData: any, role: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/${role}s`, profileData);
  }

  verify2FA(userId: number, code: string): Observable<any> {
    console.log('🔵 AuthService.verify2FA - userId:', userId, 'code:', code);
    return this.http.post(`${this.apiUrl}/verify-2fa`, { userId, code }, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response?.success && response?.user) {
          this.saveUserInfo(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('selectedRoles');
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
  }

  saveSession(token: string, user: any): void {
    this.saveUserInfo(user);
  }

  saveUserInfo(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  getToken(): string | null {
    return null;
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}