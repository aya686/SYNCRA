import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Contrat } from '../../models/contrat.model';
import { ContratService } from '../../services/contrat.service';

@Component({
  selector: 'app-creer-contrat',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './creer-contrat.component.html',
  styleUrls: ['./creer-contrat.component.scss']
})
export class CreerContratComponent implements OnInit {
  contrat: Contrat = {
    titre: '',
    description: '',
    montant: 0,
    modalitePaiement: '',
    dateDebut: '',
    dateFin: '',
    statut: 'ACTIF' as any,
    clientId: 1,
    prestataireId: 1,
    candidatureId: undefined,
    offreId: undefined,
    paiementId: undefined
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private contratService: ContratService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    console.log('=== TENTATIVE DE CRÉATION DE CONTRAT ===');
    
    // Convert dates to ISO format with time
    const contratToSend = { ...this.contrat };
    if (this.contrat.dateDebut) {
      contratToSend.dateDebut = new Date(this.contrat.dateDebut).toISOString();
    }
    if (this.contrat.dateFin) {
      contratToSend.dateFin = new Date(this.contrat.dateFin).toISOString();
    }
    
    console.log('Données du contrat à envoyer:', contratToSend);

    this.contratService.createContrat(contratToSend).subscribe({
      next: (response) => {
        console.log('✅ Contrat créé avec succès:', response);
        this.success = 'Contrat créé avec succès !';
        this.loading = false;
        // Navigate to mes-contrats after successful creation
        setTimeout(() => {
          this.router.navigate(['/contrats/mes-contrats']);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Erreur création contrat:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        console.error('Error message:', err.message);
        this.error = `Erreur lors de la création du contrat (Status ${err.status}): ${err.error?.message || err.message || 'Erreur inconnue'}`;
        this.loading = false;
      }
    });
  }

  cancel(): void {
    // Navigate back to mes contrats
    window.history.back();
  }
}
