// src/app/modules/auth/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleAuthService } from '../../services/simple-auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
  userId: number | null = null;
  isLoading = false;
  errorMessage = '';

  availableUsers = [
    { id: 1, nom: 'Admin Principal', role: 'admin' },
    { id: 2, nom: 'Jean Dupont', role: 'formateur' },
    { id: 3, nom: 'Marie Martin', role: 'participant' }
  ];

  constructor(
    private authService: SimpleAuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.userId) {
      this.errorMessage = 'Veuillez entrer un ID';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.userId).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Connexion réussie:', user);
        
        // ✅ REDIRECTION SELON LE RÔLE
        if (user.role === 'admin') {
          console.log('Redirection vers /admin');
          this.router.navigate(['/admin']);
        } else {
          console.log('Redirection vers /');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'ID invalide. Utilisez 1, 2 ou 3.';
        console.error('Erreur de connexion:', err);
      }
    });
  }

  quickLogin(userId: number) {
    this.userId = userId;
    this.onSubmit();
  }
}