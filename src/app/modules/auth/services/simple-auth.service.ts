// simple-auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';  // ← AJOUTER

export interface SimpleUser {
  id: number;
  nom: string;
  role: 'admin' | 'formateur' | 'participant';
}

const MOCK_USERS: SimpleUser[] = [
  { id: 1, nom: 'Admin Principal', role: 'admin' },
  { id: 2, nom: 'Jean Dupont', role: 'formateur' },
  { id: 3, nom: 'Marie Martin', role: 'participant' }
];

@Injectable({ providedIn: 'root' })
export class SimpleAuthService {
  private currentUserSubject = new BehaviorSubject<SimpleUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private authService: AuthService  // ← AJOUTER
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const stored = localStorage.getItem('simple_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
        console.log('✅ Utilisateur chargé:', user);
        
        // ✅ SYNC AVEC AUTH SERVICE
        this.syncWithAuthService(user);
      } catch (e) {
        localStorage.removeItem('simple_user');
      }
    }
  }

  // ✅ SYNC : Créer un utilisateur compatible avec AuthService
  private syncWithAuthService(simpleUser: SimpleUser) {
    const compatibleUser: User = {
      id: simpleUser.id.toString(),  // Convertir en string
      name: simpleUser.nom,
      email: this.getEmailForUser(simpleUser),
      role: simpleUser.role === 'admin' ? 'admin' : 'user',
      userType: this.getUserTypeForRole(simpleUser.role)
    };
    
    this.authService.setRealUser(compatibleUser);
    console.log('✅ Utilisateur synchronisé avec AuthService:', compatibleUser);
  }

  private getEmailForUser(user: SimpleUser): string {
    const emails: Record<number, string> = {
      1: 'admin@syncra.com',
      2: 'jean.dupont@example.com',
      3: 'marie.martin@example.com'
    };
    return emails[user.id] || `user${user.id}@example.com`;
  }

  private getUserTypeForRole(role: string): 'etudiant' | 'professionnel' | 'curieux' | 'expert' {
    switch(role) {
      case 'admin': return 'professionnel';
      case 'formateur': return 'expert';
      default: return 'etudiant';
    }
  }

  login(userId: number): Observable<SimpleUser> {
    console.log('🔐 Tentative de connexion avec ID:', userId);
    
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('ID utilisateur invalide. Utilisez 1, 2 ou 3');
    }
    
    return of(user).pipe(
      delay(500),
      tap(() => {
        console.log('✅ Connexion réussie:', user);
        localStorage.setItem('simple_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        
        // ✅ SYNC AVEC AUTH SERVICE
        this.syncWithAuthService(user);
      })
    );
  }

  logout() {
    console.log('🚪 Déconnexion');
    localStorage.removeItem('simple_user');
    this.currentUserSubject.next(null);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): SimpleUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isFormateur(): boolean {
    return this.currentUserSubject.value?.role === 'formateur';
  }

  isParticipant(): boolean {
    return this.currentUserSubject.value?.role === 'participant';
  }
}