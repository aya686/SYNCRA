import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DemandePartenariatService } from '../../services/demande-partenariat.service';
import { DemandePartenariat, PartenariatEntreprise, StatutDemandePartenariat } from '../../models/partenariat.model';

@Component({
  selector: 'app-recherche-partenariat',
  templateUrl: './recherche-partenariat.component.html',
  styleUrls: ['./recherche-partenariat.component.scss'],
  standalone: false
})
export class RecherchePartenariatComponent implements OnInit {
  demandes: DemandePartenariat[] = [];
  partenariats: PartenariatEntreprise[] = [];
  loading = false;
  error = '';
  showPartenariats = false;
  selectedDemande: DemandePartenariat | null = null;
  showModal = false;
  partenariatForm: any = {
    descriptionPartenariat: '',
    dateDebut: '',
    dateFin: ''
  };
  formLoading = false;
  formError = '';

  constructor(
    private router: Router,
    private demandePartenariatService: DemandePartenariatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = '';

    this.demandePartenariatService.getAllDemandes().subscribe({
      next: (data) => {
        this.demandes = data; // Afficher toutes les demandes
        this.loading = false;
        this.cdr.detectChanges();

        if (this.demandes.length === 0) {
          this.error = 'Aucune demande de partenariat disponible pour le moment.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des demandes de partenariat.';
        console.error('Erreur:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadPartenariats(): void {
    this.loading = true;
    this.error = '';
    this.showPartenariats = true;

    this.demandePartenariatService.getAllPartenariats().subscribe({
      next: (data) => {
        this.partenariats = data;
        this.loading = false;
        this.cdr.detectChanges();

        if (this.partenariats.length === 0) {
          this.error = 'Aucun partenariat en cours.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des partenariats.';
        console.error('Erreur:', err);
        this.cdr.detectChanges();
      }
    });
  }

  showDemandes(): void {
    this.showPartenariats = false;
    this.loadDemandes();
  }

  openModal(demande: DemandePartenariat): void {
    this.selectedDemande = demande;
    this.showModal = true;
    this.partenariatForm = {
      descriptionPartenariat: '',
      dateDebut: '',
      dateFin: ''
    };
    this.formError = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDemande = null;
  }

  submitPartenariat(): void {
    if (!this.partenariatForm.descriptionPartenariat || !this.partenariatForm.dateDebut) {
      this.formError = 'Veuillez remplir tous les champs requis.';
      return;
    }

    this.formLoading = true;
    this.formError = '';

    const partenariat: PartenariatEntreprise = {
      demandePartenariatId: this.selectedDemande!.id!,
      partenaire1Id: 1, // À remplacer par l'ID de l'utilisateur connecté
      partenaire2Id: this.selectedDemande!.userId,
      descriptionPartenariat: this.partenariatForm.descriptionPartenariat,
      dateDebut: this.partenariatForm.dateDebut,
      dateFin: this.partenariatForm.dateFin || undefined,
      statut: 'ACTIF' as any
    };

    this.demandePartenariatService.createPartenariat(partenariat).subscribe({
      next: (response) => {
        this.formLoading = false;
        this.closeModal();
        this.loadPartenariats();
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = 'Erreur lors de la création du partenariat. Veuillez réessayer.';
        console.error('Erreur:', err);
      }
    });
  }

  postulerNouveau(): void {
    this.router.navigate(['/partenariats/postuler-partenariat']);
  }

  getStatutClass(statut: StatutDemandePartenariat): string {
    switch (statut) {
      case StatutDemandePartenariat.APPROUVEE:
        return 'statut-approuve';
      case StatutDemandePartenariat.REFUSEE:
        return 'statut-refuse';
      default:
        return 'statut-attente';
    }
  }

  getStatutLabel(statut: StatutDemandePartenariat): string {
    switch (statut) {
      case StatutDemandePartenariat.APPROUVEE:
        return 'Approuvée';
      case StatutDemandePartenariat.REFUSEE:
        return 'Refusée';
      default:
        return 'En attente';
    }
  }
}
