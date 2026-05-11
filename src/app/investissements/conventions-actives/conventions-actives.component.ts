import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConventionService } from '../../services/convention.service';
import { Convention, StatutConvention } from '../../models/investissement.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-conventions-actives',
  imports: [CommonModule, RouterModule],
  templateUrl: './conventions-actives.component.html',
  styleUrl: './conventions-actives.component.scss'
})
export class ConventionsActivesComponent implements OnInit {
  currentUserId: number = 1; // À remplacer par l'ID de l'utilisateur connecté
  conventions: Convention[] = [];
  loading = true;
  error: string | null = null;

  constructor(private conventionService: ConventionService) {}

  ngOnInit(): void {
    this.loadConventions();
  }

  loadConventions(): void {
    this.loading = true;
    this.conventionService.getConventionsByInvestisseur(this.currentUserId).subscribe({
      next: (data) => {
        this.conventions = data.filter(c => c.statut === StatutConvention.ACTIVE);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conventions:', err);
        this.error = 'Erreur lors du chargement des conventions';
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: StatutConvention): string {
    const labels: Record<StatutConvention, string> = {
      EN_COURS_SIGNATURE: '🔄 En cours de signature',
      ACTIVE: '✅ Active',
      EXPIREE: '⏰ Expirée',
      RESILIEE: '🚫 Résiliée',
      SUSPENDUE: '⏸️ Suspendue'
    };
    return labels[statut] || statut;
  }

  getTypeConventionLabel(type: string): string {
    const labels: Record<string, string> = {
      INVESTISSEMENT_PRIVE: 'Investissement privé',
      PARTENARIAT_INSTITUTIONNEL: 'Partenariat institutionnel',
      ACCORD_CADRE: 'Accord cadre'
    };
    return labels[type] || type;
  }

  formatMontant(montant: number): string {
    if (!montant) return '-';
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  telechargerPDF(convention: Convention): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(10, 110, 189);
    doc.text('CONVENTION D\'INVESTISSEMENT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.text(`Référence : ${convention.reference}`, 105, 30, { align: 'center' });
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text(convention.titre, 20, 45);
    
    // Details
    doc.setFontSize(11);
    let y = 60;
    
    doc.text('Détails de la convention :', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Montant : ${this.formatMontant(convention.montant)}`, 25, y); y += 8;
    doc.text(`Participation : ${convention.pourcentageParticipation}%`, 25, y); y += 8;
    doc.text(`Durée : ${convention.dureeMois} mois`, 25, y); y += 8;
    doc.text(`Type : ${this.getTypeConventionLabel(convention.typeConvention)}`, 25, y); y += 8;
    doc.text(`Clause de rachat : ${convention.clauseRachat ? 'Oui' : 'Non'}`, 25, y); y += 8;
    
    if (convention.clauseRachat && convention.detailClauseRachat) {
      doc.text(`Détail clause : ${convention.detailClauseRachat}`, 25, y); y += 8;
    }
    
    // Dates
    y += 10;
    doc.setFontSize(11);
    doc.text('Dates importantes :', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Date de signature : ${this.formatDate(convention.dateSignature || '')}`, 25, y); y += 8;
    doc.text(`Date de début : ${this.formatDate(convention.dateDebut || '')}`, 25, y); y += 8;
    doc.text(`Date de fin : ${this.formatDate(convention.dateFin || '')}`, 25, y); y += 8;
    
    // Parties
    y += 10;
    doc.setFontSize(11);
    doc.text('Parties prenantes :', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`ID Projet : ${convention.projetId}`, 25, y); y += 8;
    doc.text(`ID Porteur : ${convention.porteurId}`, 25, y); y += 8;
    
    // Signatures
    y += 10;
    doc.setFontSize(11);
    doc.text('Signatures :', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Investisseur : ${convention.signeInvestisseur ? '✅ Signé' : '⏳ Non signé'}`, 25, y); y += 8;
    doc.text(`Porteur de projet : ${convention.signePorteur ? '✅ Signé' : '⏳ Non signé'}`, 25, y); y += 8;
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Document généré automatiquement par BERRY Platform', 105, 280, { align: 'center' });
    
    doc.save(`convention_${convention.reference}.pdf`);
  }
}
