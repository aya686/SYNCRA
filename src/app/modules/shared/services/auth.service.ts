// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  userType?: 'etudiant' | 'professionnel' | 'curieux' | 'expert';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initTempUser();
  }

  private initTempUser() {
    const savedUser = localStorage.getItem('temp_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
    // ✅ PLUS DE CRÉATION AUTOMATIQUE - Attendre SimpleAuthService
  }

  getCurrentUserId(): string {
    const user = this.currentUserSubject.value;
    return user?.id || 'anonymous';
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  setRealUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('temp_user', JSON.stringify(user));
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('temp_user');
  }
}