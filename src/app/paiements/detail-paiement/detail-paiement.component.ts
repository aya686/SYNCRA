import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaiementService } from '../../services/paiement.service';
import { Paiement, Transaction, Facture, StatutPaiement, TypeTransaction } from '../../models/paiement.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-detail-paiement',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detail-paiement.component.html',
  styleUrls: ['./detail-paiement.component.scss']
})
export class DetailPaiementComponent implements OnInit {
  paiementId: number | null = null;
  paiement: Paiement | null = null;
  loading = true;
  error: string | null = null;
  montantAPayer: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    this.paiementId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.paiementId) {
      this.loadPaiement();
    } else {
      this.error = 'ID du paiement non trouvé';
      this.loading = false;
    }
  }

  loadPaiement(): void {
    this.loading = true;
    this.paiementService.getPaiementById(this.paiementId!).subscribe({
      next: (data) => {
        this.paiement = data;
        this.montantAPayer = data.montantRestant;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du paiement:', err);
        this.error = 'Erreur lors du chargement du paiement';
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: StatutPaiement): string {
    const labels: Record<StatutPaiement, string> = {
      EN_ATTENTE: '⏳ En attente',
      PARTIELLEMENT_PAYE: '🔄 Partiellement payé',
      PAYE: '✅ Payé',
      EN_RETARD: '⚠️ En retard',
      REMBOURSE: '💰 Remboursé',
      ANNULE: '🚫 Annulé',
      BLOQUE: '🔒 Bloqué'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: StatutPaiement): string {
    const classes: Record<StatutPaiement, string> = {
      EN_ATTENTE: 'badge bg-warning',
      PARTIELLEMENT_PAYE: 'badge bg-info',
      PAYE: 'badge bg-success',
      EN_RETARD: 'badge bg-danger',
      REMBOURSE: 'badge bg-secondary',
      ANNULE: 'badge bg-dark',
      BLOQUE: 'badge bg-danger'
    };
    return classes[statut] || 'badge bg-light';
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      maximumFractionDigits: 2
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  initierPaiement(): void {
    if (!this.paiement || !this.paiement.id) return;

    const montant = this.montantAPayer;
    const type: TypeTransaction = this.paiement.montantPaye === 0 ? TypeTransaction.PAIEMENT_INITIAL : TypeTransaction.PAIEMENT_SOLDE;
    const expediteurId = this.paiement.payeurId;

    this.paiementService.initierPaiement(this.paiement.id, montant, type, expediteurId).subscribe({
      next: (transaction) => {
        console.log('Transaction initiée:', transaction);
        this.loadPaiement();
      },
      error: (err) => {
        console.error('Erreur lors de l\'initiation du paiement:', err);
        this.error = 'Erreur lors de l\'initiation du paiement';
      }
    });
  }

  validerTransaction(transactionId: number): void {
    this.paiementService.validerTransaction(transactionId).subscribe({
      next: () => {
        console.log('Transaction validée');
        this.loadPaiement();
      },
      error: (err) => {
        console.error('Erreur lors de la validation:', err);
      }
    });
  }

  telechargerFacture(facture: Facture): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header
    doc.setFillColor(10, 110, 189);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURE', pageWidth / 2, 25, { align: 'center' });

    // Numéro de facture
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`N° ${facture.numeroFacture} • ${this.formatDate(facture.dateEmission)}`, pageWidth / 2, 35, { align: 'center' });

    // Titre
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(facture.titre, margin, 60);

    // Montants
    doc.setFontSize(12);
    let y = 80;

    doc.text('Montant HT:', margin, y);
    doc.text(this.formatMontant(facture.montantHt), margin + 100, y);
    y += 10;

    doc.text('TVA (19%):', margin, y);
    doc.text(this.formatMontant(facture.montantTva), margin + 100, y);
    y += 10;

    doc.text('Montant TTC:', margin, y);
    doc.setFont(undefined, 'bold');
    doc.text(this.formatMontant(facture.montantTtc), margin + 100, y);
    doc.setFont(undefined, 'normal');
    y += 20;

    // Parties
    doc.text('Émetteur:', margin, y);
    doc.text(facture.nomEmetteur || `ID: ${facture.emetteurId}`, margin + 100, y);
    y += 10;

    doc.text('Destinataire:', margin, y);
    doc.text(facture.nomDestinataire || `ID: ${facture.destinataireId}`, margin + 100, y);
    y += 20;

    // Statut
    doc.text('Statut:', margin, y);
    doc.text(facture.statut, margin + 100, y);

    // Footer
    doc.setFillColor(244, 248, 253);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Document généré automatiquement par BERRY Platform', pageWidth / 2, pageHeight - 20, { align: 'center' });

    doc.save(`facture_${facture.numeroFacture}.pdf`);
  }

  retour(): void {
    this.router.navigate(['/paiements']);
  }
}
