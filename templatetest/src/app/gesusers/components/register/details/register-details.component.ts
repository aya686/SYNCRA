import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';  // ← IMPORTANT
import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';


import { UserService } from '../../../services/user.service';
import { UserRoleService } from '../../../services/user-role.service';
import { RoleService } from '../../../services/role.service';
import { FreelancerService } from '../../../services/freelancer.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { ClientService } from '../../../services/client.service';
import { InvestisseurService } from '../../../services/investisseur.service';

@Component({
  selector: 'app-register-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.scss']
})
export class RegisterDetailsComponent implements OnInit {

  selectedRoles: string[] = [];

  userForm!: FormGroup;
  freelancerForm!: FormGroup;
  etudiantForm!: FormGroup;
  clientForm!: FormGroup;
  investisseurForm!: FormGroup;

  loading = false;
  photoPreview: string | null = null;
  cvFileName: string | null = null;
  errorMessage: string | null = null;

  // Pour l'upload de la photo
  selectedPhotoFile: File | null = null;

  // États de la vérification email universitaire
  emailVerifStep: 'idle' | 'sending' | 'code_sent' | 'verified' | 'error' = 'idle';
  emailVerifMessage: string | null = null;
  emailVerified = false;

  private readonly API = 'http://localhost:8082/api';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone,
    private userService: UserService,
    private userRoleService: UserRoleService,
    private roleService: RoleService,
    private freelancerService: FreelancerService,
    private etudiantService: EtudiantService,
    private clientService: ClientService,
    private investisseurService: InvestisseurService
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('selectedRoles');
    if (!stored || JSON.parse(stored).length === 0) {
      this.router.navigate(['/gesusers/register']);
      return;
    }
    this.selectedRoles = JSON.parse(stored);
    this.initForms();
  }

  initForms(): void {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telephone: [''],
      photo: ['']
    });

    if (this.hasRole('FREELANCER')) {
      this.freelancerForm = this.fb.group({
        description: [''],
        cv: ['']
      });
    }

    if (this.hasRole('ETUDIANT')) {
      this.etudiantForm = this.fb.group({
        universite: ['', Validators.required],
        filiere: ['', Validators.required],
        anneeEtude: ['', Validators.required],
        emailUniversitaire: ['', [Validators.required, Validators.email]],
        codeVerification: ['']
      });
    }

    if (this.hasRole('CLIENT')) {
      this.clientForm = this.fb.group({
        nomEntreprise: [''],
        type: ['PARTICULIER', Validators.required],
        secteurActivite: [''],
        siteWeb: [''],
        description: ['']
      });
    }

    if (this.hasRole('INVESTISSEUR')) {
      this.investisseurForm = this.fb.group({
        budgetMin: [0, [Validators.required, Validators.min(0)]],
        budgetMax: [0, [Validators.required, Validators.min(0)]],
        domainesInteret: [''],
        description: ['']
      });
    }
  }

  hasRole(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  // Vérification email universitaire
  sendVerificationCode(): void {
    const email = this.etudiantForm?.get('emailUniversitaire')?.value;
    if (!email) {
      this.emailVerifStep = 'error';
      this.emailVerifMessage = 'Entrez votre email universitaire d\'abord.';
      return;
    }

    this.emailVerifStep = 'sending';
    this.emailVerifMessage = 'Vérification du domaine et envoi du code...';

    this.http.post(`${this.API}/email-verification/send`, { email }).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.emailVerifStep = 'code_sent';
          this.emailVerifMessage = `✅ Code envoyé à ${email}. Vérifiez votre boite universitaire.`;
          console.log('✅ Code envoyé');
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.emailVerifStep = 'error';
          this.emailVerifMessage = '❌ ' + (err.error?.error || err.error?.message || 'Erreur lors de l\'envoi.');
          console.log('❌ Erreur:', err.error);
        });
      }
    });
  }

  verifyCode(): void {
    const email = this.etudiantForm?.get('emailUniversitaire')?.value;
    const code = this.etudiantForm?.get('codeVerification')?.value;

    if (!code || code.length !== 6) {
      this.emailVerifMessage = 'Le code doit contenir 6 chiffres.';
      return;
    }

    this.http.post(`${this.API}/email-verification/verify`, { email, code }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.emailVerifStep = 'verified';
          this.emailVerified = true;
          this.emailVerifMessage = '✅ Email universitaire vérifié !';
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.emailVerifStep = 'error';
          this.emailVerifMessage = '❌ Code incorrect ou expiré. Réessayez.';
        });
      }
    });
  }

  resendCode(): void {
    this.emailVerifStep = 'idle';
    this.emailVerified = false;
    this.emailVerifMessage = null;
    this.etudiantForm?.patchValue({ codeVerification: '' });
    this.sendVerificationCode();
  }

  // Upload fichiers
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhotoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.photoPreview = reader.result as string; };
      reader.readAsDataURL(this.selectedPhotoFile);
    }
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.freelancerForm.patchValue({ cv: file.name });
      this.cvFileName = file.name;
    }
  }

  goBack(): void {
    this.router.navigate(['/gesusers/register']);
  }

  // Soumission
  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(k =>
        this.userForm.get(k)?.markAsTouched());
      return;
    }

    if (this.hasRole('ETUDIANT') && this.etudiantForm.invalid) {
      Object.keys(this.etudiantForm.controls).forEach(k =>
        this.etudiantForm.get(k)?.markAsTouched());
      return;
    }

    if (this.hasRole('ETUDIANT') && !this.emailVerified) {
      this.errorMessage = 'Veuillez vérifier votre email universitaire avant de soumettre.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const userData = {
      nom: this.userForm.value.nom,
      prenom: this.userForm.value.prenom,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      telephone: this.userForm.value.telephone,
      photo: this.userForm.value.photo
    };

    this.userService.create(userData).subscribe({
      next: (user) => {
        console.log('✅ Utilisateur créé:', user);
        this.assignRolesAndCreateProfiles(user);
      },
      error: (err) => {
        console.error('❌ Erreur création user:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création. Email peut-être déjà utilisé.';
        this.loading = false;
      }
    });
  }

  private assignRolesAndCreateProfiles(user: any): void {
    let completed = 0;
    const total = this.selectedRoles.length;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        console.log('✅ Tous les rôles et profils créés');
        this.router.navigate(['/gesusers/profile', user.id]);
      }
    };

    this.selectedRoles.forEach(role => {
      this.roleService.getByLibelle(role).subscribe({
        next: (roleEntity) => {
          let dateExpiration = undefined;
          if (role === 'ETUDIANT') {
            const date = new Date();
            date.setDate(date.getDate() + 30);
            dateExpiration = date.toISOString();
          }

          this.userRoleService.assignRole(user.id, roleEntity.id!, dateExpiration).subscribe({
            next: () => {
              this.createSpecificProfile(user.id, role);
              checkComplete();
            },
            error: (err) => {
              console.error(`❌ Erreur assignation rôle ${role}:`, err);
              checkComplete();
            }
          });
        },
        error: (err) => {
          console.error(`❌ Rôle ${role} non trouvé:`, err);
          checkComplete();
        }
      });
    });
  }

  private createSpecificProfile(userId: number, role: string): void {
    switch (role) {
      case 'FREELANCER':
        if (this.freelancerForm) {
          this.freelancerService.create(userId, this.freelancerForm.value).subscribe({
            next: () => console.log('✅ Freelancer créé'),
            error: (err) => console.error('❌ Erreur freelancer:', err)
          });
        }
        break;

      case 'ETUDIANT':
        if (this.etudiantForm) {
          const { codeVerification, ...etudiantData } = this.etudiantForm.value;
          this.etudiantService.create(userId, etudiantData).subscribe({
            next: () => console.log('✅ Étudiant créé'),
            error: (err) => console.error('❌ Erreur étudiant:', err)
          });
        }
        break;

      case 'CLIENT':
        if (this.clientForm) {
          this.clientService.create(userId, this.clientForm.value).subscribe({
            next: () => console.log('✅ Client créé'),
            error: (err) => console.error('❌ Erreur client:', err)
          });
        }
        break;

      case 'INVESTISSEUR':
        if (this.investisseurForm) {
          this.investisseurService.create(userId, this.investisseurForm.value).subscribe({
            next: () => console.log('✅ Investisseur créé'),
            error: (err) => console.error('❌ Erreur investisseur:', err)
          });
        }
        break;
    }
  }
}