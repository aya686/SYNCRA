import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MiseFondsService } from '../../services/mise-fonds.service';
import { MiseFonds, TypeInvestissement, StatutMiseFonds } from '../../models/investissement.model';

@Component({
  selector: 'app-soumettre-mise-fonds',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './soumettre-mise-fonds.component.html',
  styleUrl: './soumettre-mise-fonds.component.scss'
})
export class SoumettreMiseFondsComponent implements OnInit {
  projetId: number = 0;
  currentUserId: number = 1; // À remplacer par l'ID de l'utilisateur connecté

  // Project details (mock data)
  projet = {
    titre: 'Plateforme e-commerce alimentaire',
    porteur: 'StartupTN',
    montantTotal: 150000,
    dejaFinance: 60000,
    resteAFinancer: 90000
  };

  // Form data
  miseFonds: MiseFonds = {
    montant: 0,
    pourcentageParticipation: 0,
    dureeMois: 24,
    typeInvestissement: TypeInvestissement.PRISE_PARTICIPATION,
    statut: StatutMiseFonds.EN_ATTENTE,
    projetId: 0,
    preuveFonds: '',
    ribBancaire: ''
  };

  // AI Analysis
  aiAnalysis = {
    scoreViabilite: 85,
    roiEstime: '12-18%',
    niveauRisque: 'MOYEN',
    recommandation: 'INVESTISSEMENT CONSEILLÉ',
    pointsForts: [
      'Marché en croissance',
      'Équipe expérimentée',
      'Modèle économique viable'
    ],
    pointsRisque: [
      'Concurrence forte sur le marché',
      'Dépend du financement complet'
    ]
  };

  currentStep = 1;
  loading = false;
  error: string | null = null;
  success = false;

  conditionsAcceptees = false;
  informationsExactes = false;

  constructor(
    private route: ActivatedRoute,
    private miseFondsService: MiseFondsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projetId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    this.miseFonds.projetId = this.projetId;
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  soumettreMiseFonds(): void {
    if (!this.conditionsAcceptees || !this.informationsExactes) {
      this.error = 'Vous devez accepter les conditions et confirmer l\'exactitude des informations';
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('Données à envoyer:', this.miseFonds);

    this.miseFondsService.soumettreMiseFonds(this.currentUserId, this.miseFonds).subscribe({
      next: (response) => {
        console.log('✅ Mise de fonds soumise avec succès:', response);
        this.success = true;
        this.loading = false;
        // Rediriger vers le Dashboard Investisseur après succès
        setTimeout(() => {
          this.router.navigate(['/investissements/dashboard-investisseur']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la soumission de la mise de fonds:', err);
        console.error('Détails de l\'erreur:', err.error);
        let errorMsg = 'Erreur lors de la soumission de la mise de fonds';
        if (err.error && err.error.message) {
          errorMsg += ': ' + err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          errorMsg += ': ' + err.error;
        }
        this.error = errorMsg;
        this.loading = false;
        
        // Si l'erreur concerne la vérification du profil, rediriger vers le dashboard
        if (err.error?.message?.includes('profil doit être vérifié')) {
          setTimeout(() => {
            // Optionnel: rediriger vers le dashboard investisseur
            // this.router.navigate(['/investissements/dashboard-investisseur']);
          }, 3000);
        }
      }
    });
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Convertir en base64 pour l'envoi au backend
      const reader = new FileReader();
      reader.onload = (e) => {
        this.miseFonds.preuveFonds = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(montant);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  }
}
