import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ContratService } from '../../services/contrat.service';
import { Contrat } from '../../models/contrat.model';

@Component({
  selector: 'app-paiement-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paiement-contrat.component.html',
  styleUrls: ['./paiement-contrat.component.scss']
})
export class PaiementContratComponent implements OnInit {
  contrat: Contrat | null = null;
  isLoaded = false;
  error = '';
  success = '';

  // Formulaire de paiement
  nom = '';
  prenom = '';
  numeroCarte = '';
  dateExpiration = '';
  cvv = '';
  modePaiement = 'CARTE'; // 'CARTE' ou 'D17'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    console.log('PaiementContratComponent initialisé');
    const contratId = this.route.snapshot.paramMap.get('id');
    console.log('ID du contrat:', contratId);
    if (contratId) {
      this.loadContrat(+contratId);
    } else {
      this.error = 'ID du contrat manquant';
      console.error('ID du contrat manquant');
    }
  }

  loadContrat(id: number): void {
    console.log('Chargement du contrat ID:', id);
    console.log('isLoaded avant chargement:', this.isLoaded);
    this.contratService.getContratById(id).subscribe({
      next: (data) => {
        console.log('Contrat chargé avec succès:', data);
        this.contrat = data;
        this.isLoaded = true;
        console.log('isLoaded après chargement:', this.isLoaded);
      },
      error: (err) => {
        console.error('Erreur chargement contrat:', err);
        this.error = 'Erreur lors du chargement du contrat';
        this.isLoaded = true;
        console.log('isLoaded après erreur:', this.isLoaded);
      }
    });
  }

  validerNumeroCarte(): boolean {
    // Validation basique du numéro de carte (doit contenir 13-19 chiffres)
    const regex = /^[0-9]{13,19}$/;
    return regex.test(this.numeroCarte);
  }

  validerCVV(): boolean {
    // Validation du CVV (doit contenir 3 ou 4 chiffres)
    const regex = /^[0-9]{3,4}$/;
    return regex.test(this.cvv);
  }

  validerDateExpiration(): boolean {
    // Validation de la date d'expiration (format MM/YY)
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(this.dateExpiration)) {
      return false;
    }

    // Vérifier que la date n'est pas dépassée
    const [mois, annee] = this.dateExpiration.split('/').map(Number);
    const maintenant = new Date();
    const dateExp = new Date(2000 + annee, mois - 1);

    return dateExp > maintenant;
  }

  validerForm(): boolean {
    if (!this.nom.trim() || !this.prenom.trim()) {
      this.error = 'Veuillez remplir votre nom et prénom';
      return false;
    }

    if (this.modePaiement === 'CARTE') {
      if (!this.validerNumeroCarte()) {
        this.error = 'Numéro de carte invalide (doit contenir 13-19 chiffres)';
        return false;
      }

      if (!this.validerDateExpiration()) {
        this.error = 'Date d\'expiration invalide ou dépassée';
        return false;
      }

      if (!this.validerCVV()) {
        this.error = 'CVV invalide (doit contenir 3 ou 4 chiffres)';
        return false;
      }
    }

    return true;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.validerForm()) {
      return;
    }

    // Simulation du paiement
    this.success = 'Traitement du paiement en cours...';

    setTimeout(() => {
      this.success = 'Paiement confirmé avec succès !';

      // Marquer le contrat comme payé
      if (this.contrat) {
        this.contrat.paiementEffectue = true;
        // Mettre à jour le contrat dans le backend
        this.contratService.updateContrat(this.contrat.id!, this.contrat).subscribe({
          next: () => {
            console.log('Contrat marqué comme payé');
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour du contrat:', err);
          }
        });
      }

      // Rediriger vers la page des contrats après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/contrats/mes-contrats']);
      }, 3000);
    }, 2000);
  }

  annuler(): void {
    this.router.navigate(['/contrats/mes-contrats']);
  }
}
