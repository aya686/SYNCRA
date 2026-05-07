import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SendgridService } from '../../services/sendgrid.service';

@Component({
  selector: 'app-formulaire-negociation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-negociation.component.html',
  styleUrl: './formulaire-negociation.component.scss'
})
export class FormulaireNegociationComponent implements OnInit {
  nom = '';
  prenom = '';
  description = '';
  projetNom = '';
  loading = false;
  success = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sendgridService: SendgridService
  ) {}

  ngOnInit(): void {
    this.projetNom = this.route.snapshot.paramMap.get('projet') || 'Projet inconnu';
  }

  onInputChange(): void {
    this.error = null;
  }

  envoyerDemande(): void {
    console.log('Valeurs du formulaire:', {
      nom: this.nom,
      prenom: this.prenom,
      description: this.description,
      nomLength: this.nom?.length,
      prenomLength: this.prenom?.length,
      descriptionLength: this.description?.length
    });

    const nomValid = this.nom && this.nom.trim().length > 0;
    const prenomValid = this.prenom && this.prenom.trim().length > 0;
    const descriptionValid = this.description && this.description.trim().length > 0;

    console.log('Validation:', {
      nomValid,
      prenomValid,
      descriptionValid
    });

    if (!nomValid || !prenomValid || !descriptionValid) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.sendgridService.sendNegotiationEmail(
      this.nom,
      this.prenom,
      this.description,
      this.projetNom
    ).subscribe({
      next: (response) => {
        console.log('Email envoyé avec succès:', response);
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de l\'email:', err);
        this.error = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/investissements/investisseurs-partenaires']);
  }
}
