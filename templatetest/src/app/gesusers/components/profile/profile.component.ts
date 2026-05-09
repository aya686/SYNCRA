import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { Competence } from '../../models/competence.model';
import { Portfolio } from '../../models/portfolio.model';
import { CompetenceService } from '../../services/competence.service';
import { PortfolioService } from '../../services/portfolio.service';
import { RoleService } from '../../services/role.service';
import { UserRoleService } from '../../services/user-role.service';
import { UserService } from '../../services/user.service';
import { Role } from '../../models/role.model';
import { UserRole } from '../../models/user-role.model';
import { FreelancerService } from '../../services/freelancer.service';
import { EtudiantService } from '../../services/etudiant.service';
import { ClientService } from '../../services/client.service';
import { InvestisseurService } from '../../services/investisseur.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  
  userId!: number;
  user!: User;
  
  activeRoles: UserRole[] = [];
  availableRoles: Role[] = [];
  
  showRoleModal = false;
  selectedRole: Role | null = null;
  
  tempEtudiantForm!: FormGroup;
  tempFreelancerForm!: FormGroup;
  tempClientForm!: FormGroup;
  tempInvestisseurForm!: FormGroup;
  
  competences: Competence[] = [];
  showSkillForm = false;
  skillForm!: FormGroup;
  editingSkill: Competence | null = null;
  
  portfolios: Portfolio[] = [];
  showPortfolioForm = false;
  portfolioForm!: FormGroup;
  editingPortfolio: Portfolio | null = null;
  
  isEditingProfile = false;
  profileForm!: FormGroup;
  photoPreview: string | null = null;
  selectedPhotoFile: File | null = null;
  
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private userRoleService: UserRoleService,
    private roleService: RoleService,
    private competenceService: CompetenceService,
    private portfolioService: PortfolioService,
    private freelancerService: FreelancerService,
    private etudiantService: EtudiantService,
    private clientService: ClientService,
    private investisseurService: InvestisseurService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.userId) {
      this.router.navigate(['/']);
      return;
    }
    
    this.initForms();
    this.initTempForms();
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.user) {
        console.log('🔄 Rechargement forcé du profil');
        this.cdr.detectChanges();
      }
    }, 500);
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      photo: ['']
    });
    
    this.skillForm = this.fb.group({
      libelle: ['', Validators.required],
      niveau: ['INTERMEDIAIRE', Validators.required],
      categorie: ['']
    });
    
    this.portfolioForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      lien: [''],
      fichier: ['']
    });
  }

  initTempForms(): void {
    this.tempEtudiantForm = this.fb.group({
      universite: ['', Validators.required],
      filiere: ['', Validators.required],
      anneeEtude: ['', Validators.required],
      emailUniversitaire: ['', [Validators.required, Validators.email]]
    });
    
    this.tempFreelancerForm = this.fb.group({
      description: [''],
      cv: ['']
    });
    
    this.tempClientForm = this.fb.group({
      nomEntreprise: [''],
      type: ['PARTICULIER', Validators.required],
      secteurActivite: [''],
      siteWeb: [''],
      description: ['']
    });
    
    this.tempInvestisseurForm = this.fb.group({
      budgetMin: [0, [Validators.required, Validators.min(0)]],
      budgetMax: [0, [Validators.required, Validators.min(0)]],
      domainesInteret: [''],
      description: ['']
    });
  }

  goBack(): void {
    this.router.navigate(['/gesusers/register']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/my-login']);
  }

  loadAllData(): void {
    this.loadUser();
    this.loadActiveRoles();
    this.loadAvailableRoles();
    this.loadCompetences();
    this.loadPortfolios();
  }

  loadUser(): void {
    console.log('🔍 Chargement user ID:', this.userId);
    this.userService.getById(this.userId).subscribe({
      next: (data) => {
        console.log('✅ User chargé:', data);
        if (data.photo && !data.photo.startsWith('http')) {
          data.photo = 'http://localhost:8082' + data.photo;
        }
        this.user = data;
        this.profileForm.patchValue({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          photo: data.photo || ''
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement user:', err);
      }
    });
  }

  loadActiveRoles(): void {
    this.userRoleService.getActiveByUser(this.userId).subscribe({
      next: (data) => {
        this.activeRoles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement rôles actifs:', err)
    });
  }

  loadAvailableRoles(): void {
    this.roleService.getAll().subscribe({
      next: (allRoles) => {
        const activeRoleIds = this.activeRoles.map(r => r.roleId);
        this.availableRoles = allRoles.filter(r => 
          !activeRoleIds.includes(r.id!) && r.libelle !== 'admin'
        );
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement rôles disponibles:', err)
    });
  }

  loadCompetences(): void {
    this.competenceService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.competences = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement compétences:', err)
    });
  }

  loadPortfolios(): void {
    this.portfolioService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.portfolios = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement portfolios:', err)
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.profileForm.patchValue({
        nom: this.user.nom,
        prenom: this.user.prenom,
        email: this.user.email,
        telephone: this.user.telephone || '',
        photo: this.user.photo || ''
      });
    }
    this.cdr.detectChanges();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhotoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedPhotoFile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    
    this.loading = true;
    
    if (this.selectedPhotoFile) {
      const formData = new FormData();
      formData.append('nom', this.profileForm.value.nom);
      formData.append('prenom', this.profileForm.value.prenom);
      formData.append('email', this.profileForm.value.email);
      formData.append('telephone', this.profileForm.value.telephone || '');
      formData.append('photo', this.selectedPhotoFile);
      
      this.userService.updateWithPhoto(this.userId, formData).subscribe({
        next: (updated) => {
          if (updated.photo && !updated.photo.startsWith('http')) {
            updated.photo = 'http://localhost:8082' + updated.photo;
          }
          this.user = updated;
          this.isEditingProfile = false;
          this.loading = false;
          this.selectedPhotoFile = null;
          this.photoPreview = null;
          this.cdr.detectChanges();
          console.log('✅ Profil mis à jour avec photo');
        },
        error: (err) => {
          console.error('Erreur mise à jour:', err);
          this.loading = false;
        }
      });
    } else {
      this.userService.update(this.userId, this.profileForm.value).subscribe({
        next: (updated) => {
          this.user = updated;
          this.isEditingProfile = false;
          this.loading = false;
          this.cdr.detectChanges();
          console.log('✅ Profil mis à jour');
        },
        error: (err) => {
          console.error('Erreur mise à jour:', err);
          this.loading = false;
        }
      });
    }
  }

  getDaysUntilExpiration(dateExpiration?: string): number | null {
    if (!dateExpiration) return null;
    const diff = new Date(dateExpiration).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  isExpiringSoon(dateExpiration?: string): boolean {
    const days = this.getDaysUntilExpiration(dateExpiration);
    return days !== null && days <= 7 && days > 0;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getRoleIcon(roleLibelle: string): string {
    const icons: { [key: string]: string } = {
      'FREELANCER': 'ti ti-briefcase',
      'ETUDIANT': 'ti ti-school',
      'CLIENT': 'ti ti-building-store',
      'INVESTISSEUR': 'ti ti-chart-line'
    };
    return icons[roleLibelle] || 'ti ti-circle';
  }

  getRoleColor(roleLibelle: string): string {
    const colors: { [key: string]: string } = {
      'FREELANCER': '#0284c7',
      'ETUDIANT': '#16a34a',
      'CLIENT': '#d97706',
      'INVESTISSEUR': '#7c3aed'
    };
    return colors[roleLibelle] || '#64748b';
  }

  openAddRoleModal(): void {
    this.showRoleModal = true;
  }

  closeAddRoleModal(): void {
    this.showRoleModal = false;
    this.selectedRole = null;
  }

  selectRoleToAdd(role: Role): void {
    this.selectedRole = role;
    if (role.libelle === 'ETUDIANT') {
      this.tempEtudiantForm.reset();
    } else if (role.libelle === 'FREELANCER') {
      this.tempFreelancerForm.reset();
    } else if (role.libelle === 'CLIENT') {
      this.tempClientForm.reset();
    } else if (role.libelle === 'INVESTISSEUR') {
      this.tempInvestisseurForm.reset();
    }
    this.cdr.detectChanges();
  }

  submitAddRole(): void {
    if (!this.selectedRole) return;
    
    const roleLibelle = this.selectedRole.libelle;
    let specificData = null;
    let isValid = true;
    
    if (roleLibelle === 'ETUDIANT') {
      const emailUniv = this.tempEtudiantForm.get('emailUniversitaire')?.value;
      if (emailUniv) {
        const domaine = emailUniv.split('@')[1]?.toLowerCase();
        const domainesBloques = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
                                  'icloud.com', 'live.com', 'protonmail.com', 'yopmail.com', 
                                  'mail.com', 'gmx.com', 'aol.com'];
        
        if (domainesBloques.includes(domaine)) {
          this.tempEtudiantForm.get('emailUniversitaire')?.setErrors({ invalidDomain: true });
          isValid = false;
        } else {
          this.tempEtudiantForm.get('emailUniversitaire')?.setErrors(null);
        }
      }
      
      if (this.tempEtudiantForm.invalid) {
        isValid = false;
        Object.keys(this.tempEtudiantForm.controls).forEach(k =>
          this.tempEtudiantForm.get(k)?.markAsTouched()
        );
      } else {
        specificData = this.tempEtudiantForm.value;
      }
    } else if (roleLibelle === 'FREELANCER') {
      specificData = this.tempFreelancerForm.value;
    } else if (roleLibelle === 'CLIENT') {
      if (this.tempClientForm.invalid) {
        isValid = false;
        Object.keys(this.tempClientForm.controls).forEach(k =>
          this.tempClientForm.get(k)?.markAsTouched()
        );
      } else {
        specificData = this.tempClientForm.value;
      }
    } else if (roleLibelle === 'INVESTISSEUR') {
      if (this.tempInvestisseurForm.invalid) {
        isValid = false;
        Object.keys(this.tempInvestisseurForm.controls).forEach(k =>
          this.tempInvestisseurForm.get(k)?.markAsTouched()
        );
      } else {
        specificData = this.tempInvestisseurForm.value;
      }
    }
    
    if (!isValid) return;
    
    let dateExpiration = undefined;
    if (roleLibelle === 'ETUDIANT') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      dateExpiration = date.toISOString();
    }
    
    this.userRoleService.assignRole(this.userId, this.selectedRole.id!, dateExpiration).subscribe({
      next: () => {
        this.createSpecificProfile(this.userId, roleLibelle, specificData);
        this.closeAddRoleModal();
        this.loadActiveRoles();
        this.loadAvailableRoles();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur ajout rôle:', err)
    });
  }

  private createSpecificProfile(userId: number, role: string, data: any): void {
    switch (role) {
      case 'FREELANCER':
        this.freelancerService.create(userId, data).subscribe({
          next: () => console.log('✅ Freelancer créé'),
          error: (err) => console.error('Erreur freelancer:', err)
        });
        break;
      case 'ETUDIANT':
        this.etudiantService.create(userId, data).subscribe({
          next: () => console.log('✅ Étudiant créé'),
          error: (err) => console.error('Erreur étudiant:', err)
        });
        break;
      case 'CLIENT':
        this.clientService.create(userId, data).subscribe({
          next: () => console.log('✅ Client créé'),
          error: (err) => console.error('Erreur client:', err)
        });
        break;
      case 'INVESTISSEUR':
        this.investisseurService.create(userId, data).subscribe({
          next: () => console.log('✅ Investisseur créé'),
          error: (err) => console.error('Erreur investisseur:', err)
        });
        break;
    }
  }

  revokeRole(userRoleId: number): void {
    if (confirm('Retirer ce rôle ?')) {
      this.userRoleService.revokeRole(userRoleId, 'Retiré par l\'utilisateur').subscribe({
        next: () => {
          this.loadActiveRoles();
          this.loadAvailableRoles();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur révocation:', err)
      });
    }
  }

  openSkillForm(skill?: Competence): void {
    if (skill) {
      this.editingSkill = skill;
      this.skillForm.patchValue({
        libelle: skill.libelle,
        niveau: skill.niveau,
        categorie: skill.categorie || ''
      });
    } else {
      this.editingSkill = null;
      this.skillForm.reset({ niveau: 'INTERMEDIAIRE' });
    }
    this.showSkillForm = true;
    this.cdr.detectChanges();
  }

  saveSkill(): void {
    if (this.skillForm.invalid) return;
    
    const skillData = this.skillForm.value;
    
    if (this.editingSkill) {
      this.competenceService.update(this.editingSkill.id!, skillData).subscribe({
        next: () => {
          this.showSkillForm = false;
          this.loadCompetences();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur mise à jour compétence:', err)
      });
    } else {
      this.competenceService.create(this.userId, skillData).subscribe({
        next: () => {
          this.showSkillForm = false;
          this.loadCompetences();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur création compétence:', err)
      });
    }
  }

  deleteSkill(id: number): void {
    if (confirm('Supprimer cette compétence ?')) {
      this.competenceService.delete(id).subscribe({
        next: () => {
          this.loadCompetences();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  openPortfolioForm(portfolio?: Portfolio): void {
    if (portfolio) {
      this.editingPortfolio = portfolio;
      this.portfolioForm.patchValue({
        titre: portfolio.titre,
        description: portfolio.description || '',
        lien: portfolio.lien || '',
        fichier: portfolio.fichier || ''
      });
    } else {
      this.editingPortfolio = null;
      this.portfolioForm.reset();
    }
    this.showPortfolioForm = true;
    this.cdr.detectChanges();
  }

  savePortfolio(): void {
    if (this.portfolioForm.invalid) return;
    
    const portfolioData = this.portfolioForm.value;
    
    if (this.editingPortfolio) {
      this.portfolioService.update(this.editingPortfolio.id!, portfolioData).subscribe({
        next: () => {
          this.showPortfolioForm = false;
          this.loadPortfolios();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur mise à jour portfolio:', err)
      });
    } else {
      this.portfolioService.create(this.userId, portfolioData).subscribe({
        next: () => {
          this.showPortfolioForm = false;
          this.loadPortfolios();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur création portfolio:', err)
      });
    }
  }

  deletePortfolio(id: number): void {
    if (confirm('Supprimer ce projet ?')) {
      this.portfolioService.delete(id).subscribe({
        next: () => {
          this.loadPortfolios();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  hasRole(roleName: string): boolean {
    return this.activeRoles.some(r => r.roleLibelle === roleName);
  }

  showSkillsAndPortfolio(): boolean {
    return this.hasRole('FREELANCER') || this.hasRole('ETUDIANT');
  }

  getNiveauLabel(niveau: string): string {
    const labels: { [key: string]: string } = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'EXPERT': 'Expert'
    };
    return labels[niveau] || niveau;
  }

  getNiveauClass(niveau: string): string {
    const classes: { [key: string]: string } = {
      'DEBUTANT': 'niveau-debutant',
      'INTERMEDIAIRE': 'niveau-intermediaire',
      'EXPERT': 'niveau-expert'
    };
    return classes[niveau] || '';
  }
}