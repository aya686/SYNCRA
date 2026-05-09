// src/app/shared/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SimpleAuthService } from '../../../modules/auth/services/simple-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: SimpleAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private authService: SimpleAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('🔒 AdminGuard - Vérification en cours...');
    console.log('isLoggedIn:', this.authService.isLoggedIn());
    console.log('currentUser:', this.authService.getCurrentUser());
    
    // 1. Vérifier si connecté
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Non connecté → redirection vers /login');
      this.router.navigate(['/login']);
      return false;
    }
    
    // 2. Vérifier si c'est un admin
    if (this.authService.isAdmin()) {
      console.log('✅ Est admin → accès autorisé');
      return true;
    }
    
    // 3. Connecté mais pas admin
    console.log('❌ Connecté mais pas admin → redirection vers /');
    this.router.navigate(['/']);
    return false;
  }
}