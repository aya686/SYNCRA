import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm:    FormGroup;
  twoFAForm:    FormGroup;
  loading     = false;
  errorMessage= '';
  show2FA     = false;
  tempUserId: number | null = null;
  showPassword= false;
  rememberMe  = false;
  qrCodeImage: string | null = null;

  constructor(
    private fb:          FormBuilder,
    private router:      Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.twoFAForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
      this.rememberMe = true;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading      = true;
    this.errorMessage = '';

    if (this.rememberMe) {
      localStorage.setItem('savedEmail', this.loginForm.value.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('📥 Réponse complète:', response);
        
        console.log('🎯 Décision:', response.decision);
        console.log('📍 Règle déclenchée:', response.rule_triggered);
        console.log('📊 Score ML:', response.riskScore);
        
        if (response.explanation) {
          console.log('🔍 Explication:', response.explanation.reason_text);
          if (response.explanation.top_factors?.length > 0) {
            console.log('📊 Top facteurs:', response.explanation.top_factors);
          }
          if (response.explanation.score_breakdown) {
            console.log('📈 Score breakdown:', response.explanation.score_breakdown);
          }
        }
        
        // ✅ Cas 1 : Connexion réussie (pas de 2FA)
        if (response.success === true && response.token && response.user) {
          this.authService.saveSession(response.token, response.user);
          this.router.navigate(['/gesusers/profile', response.user.id]);
        }
        // ✅ Cas 2 : 2FA requis
        else if (response.needs2FA === true) {
          this.show2FA = true;
          this.tempUserId = response.userId;
          this.qrCodeImage = response.qrCode;
          this.loading = false;
          this.errorMessage = '';
        }
        // ❌ Cas 3 : Échec de connexion (email/mot de passe incorrect)
        else {
          this.errorMessage = response.message || 'Email ou mot de passe incorrect';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ Erreur HTTP:', err);
        // ✅ Récupérer le message d'erreur du body
        this.errorMessage = err.message || err.error?.message || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }

  verify2FA(): void {
    if (this.twoFAForm.invalid || !this.tempUserId) return;

    this.loading      = true;
    this.errorMessage = '';

    console.log('🔵 Envoi 2FA - userId:', this.tempUserId);
    console.log('🔵 Envoi 2FA - code:', this.twoFAForm.value.code);

    this.authService.verify2FA(this.tempUserId, this.twoFAForm.value.code).subscribe({
      next: (response) => {
        console.log('🟢 Réponse 2FA:', response);
        if (response.success && response.token && response.user) {
          this.authService.saveSession(response.token, response.user);
          this.router.navigate(['/gesusers/profile', response.user.id]);
        } else {
          this.errorMessage = response.message || 'Code invalide';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('🔴 Erreur 2FA:', err);
        this.errorMessage = err.error?.message || 'Code 2FA invalide';
        this.loading = false;
      }
    });
  }

  backToLogin(): void {
    this.show2FA = false;
    this.tempUserId = null;
    this.qrCodeImage = null;
    this.errorMessage = '';
    this.twoFAForm.reset();
  }
}