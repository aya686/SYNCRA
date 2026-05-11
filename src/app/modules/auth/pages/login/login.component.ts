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
  userId: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: SimpleAuthService,
    private router: Router
  ) {}

  onSubmit() {
    const id = Number(this.userId);

    if (!id || isNaN(id)) {
      this.errorMessage = 'Veuillez entrer un ID valide (1, 2 ou 3)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(id).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'ID invalide. Utilisez 1, 2 ou 3.';
      }
    });
  }

  quickLogin(userId: number) {
    this.userId = userId;
    this.onSubmit();
  }
}