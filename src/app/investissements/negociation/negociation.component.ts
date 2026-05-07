import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Negociation, MessageNegociation, StatutNegociation, RoleExpediteur } from '../../models/investissement.model';

@Component({
  selector: 'app-negociation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './negociation.component.html',
  styleUrl: './negociation.component.scss'
})
export class NegociationComponent implements OnInit {
  StatutNegociation = StatutNegociation;
  negociationId: number = 0;
  currentUserId: number = 1; // À remplacer par l'ID de l'utilisateur connecté
  currentUserRole: RoleExpediteur = RoleExpediteur.INVESTISSEUR;

  negociation: Negociation = {
    statut: StatutNegociation.EN_COURS,
    montantPropose: 50000,
    pourcentagePropose: 10,
    dureeProposeeMois: 24,
    montantFinal: null,
    pourcentageFinal: null,
    dureeFinaleMois: null,
    clauseRachatNegociee: false,
    investisseurUserId: 1,
    porteurUserId: 2,
    messages: []
  };

  newMessage: string = '';
  loading = false;
  error: string | null = null;

  // Mock messages
  messages: MessageNegociation[] = [
    {
      contenu: 'Bonjour, je propose 50 000 TND pour 10% de participation sur 24 mois.',
      dateEnvoi: '2026-04-10T10:30:00',
      roleExpediteur: RoleExpediteur.INVESTISSEUR
    },
    {
      contenu: 'Merci pour votre proposition. Je propose plutôt 12% pour 50 000 TND sur 30 mois.',
      dateEnvoi: '2026-04-10T14:45:00',
      roleExpediteur: RoleExpediteur.PORTEUR
    },
    {
      contenu: 'C\'est un peu élevé pour moi. Je peux aller à 11% sur 24 mois.',
      dateEnvoi: '2026-04-11T09:15:00',
      roleExpediteur: RoleExpediteur.INVESTISSEUR
    },
    {
      contenu: 'Accepté ! On se met d\'accord sur 11% sur 24 mois.',
      dateEnvoi: '2026-04-11T11:30:00',
      roleExpediteur: RoleExpediteur.PORTEUR
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.negociationId = Number(this.route.snapshot.paramMap.get('id')) || 0;
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const message: MessageNegociation = {
      contenu: this.newMessage,
      dateEnvoi: new Date().toISOString(),
      roleExpediteur: this.currentUserRole
    };

    this.messages.push(message);
    this.newMessage = '';

    // Scroll to bottom
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-list');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  accepterAccord(): void {
    this.negociation.statut = StatutNegociation.ACCEPTEE;
    this.negociation.montantFinal = 50000;
    this.negociation.pourcentageFinal = 11;
    this.negociation.dureeFinaleMois = 24;
    this.negociation.clauseRachatNegociee = true;
    
    alert('Accord accepté ! Une convention sera générée automatiquement.');
  }

  refuserAccord(): void {
    if (confirm('Êtes-vous sûr de vouloir refuser cet accord ?')) {
      this.negociation.statut = StatutNegociation.ECHOUEE;
      alert('Négociation terminée sans accord.');
    }
  }

  annulerNegociation(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette négociation ?')) {
      this.negociation.statut = StatutNegociation.ANNULEE;
      alert('Négociation annulée.');
    }
  }

  getStatutLabel(statut: StatutNegociation): string {
    const labels: Record<StatutNegociation, string> = {
      EN_COURS: '🔄 En cours',
      ACCEPTEE: '✅ Acceptée',
      ECHOUEE: '❌ Échouée',
      ANNULEE: '🚫 Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: StatutNegociation): string {
    const classes: Record<StatutNegociation, string> = {
      EN_COURS: 'badge-warning',
      ACCEPTEE: 'badge-success',
      ECHOUEE: 'badge-danger',
      ANNULEE: 'badge-secondary'
    };
    return classes[statut] || 'badge-secondary';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleLabel(role: RoleExpediteur): string {
    return role === RoleExpediteur.INVESTISSEUR ? 'Investisseur' : 'Porteur';
  }

  getMessageClass(role: RoleExpediteur): string {
    const isMyMessage = role === this.currentUserRole;
    return isMyMessage ? 'message-sent' : 'message-received';
  }

  isNegociationTerminee(): boolean {
    return this.negociation.statut === StatutNegociation.ACCEPTEE ||
           this.negociation.statut === StatutNegociation.ECHOUEE ||
           this.negociation.statut === StatutNegociation.ANNULEE;
  }
}
