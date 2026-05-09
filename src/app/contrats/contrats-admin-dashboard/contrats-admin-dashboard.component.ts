import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Contrat, StatutContrat, Clause } from '../../models/contrat.model';
import { ContratService } from '../../services/contrat.service';
import { ClauseService } from '../../services/clause.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-contrats-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contrats-admin-dashboard.component.html',
  styleUrls: ['./contrats-admin-dashboard.component.scss']
})
export class ContratsAdminDashboardComponent implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  loading = false;
  error = '';

  // Filters
  searchTitre = '';
  filterStatut: StatutContrat | null = null;
  filterSignature: 'none' | 'client' | 'freelancer' | 'both' | null = null;

  // Statistics
  stats = {
    total: 0,
    sansSignature: 0,
    signatureClient: 0,
    signatureFreelancer: 0,
    doubleSignature: 0
  };

  // Selected contract for PDF
  selectedContrat: Contrat | null = null;
  selectedContratClauses: Clause[] = [];

  constructor(
    private contratService: ContratService,
    private clauseService: ClauseService
  ) {}

  ngOnInit(): void {
    this.loadContrats();
  }

  loadContrats(): void {
    this.loading = true;
    this.contratService.getAllContrats().subscribe({
      next: (data) => {
        console.log('Tous les contrats récupérés:', data);
        this.contrats = data;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement contrats:', err);
        this.error = 'Erreur lors du chargement des contrats';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredContrats = this.contrats.filter(contrat => {
      // Filter by titre
      if (this.searchTitre && !contrat.titre.toLowerCase().includes(this.searchTitre.toLowerCase())) {
        return false;
      }

      // Filter by statut
      if (this.filterStatut && contrat.statut !== this.filterStatut) {
        return false;
      }

      // Filter by signature
      if (this.filterSignature) {
        const signatures = this.getSignatureStatus(contrat);
        if (this.filterSignature === 'none' && signatures !== 'none') return false;
        if (this.filterSignature === 'client' && signatures !== 'client') return false;
        if (this.filterSignature === 'freelancer' && signatures !== 'freelancer') return false;
        if (this.filterSignature === 'both' && signatures !== 'both') return false;
      }

      return true;
    });
  }

  calculateStats(): void {
    this.stats.total = this.contrats.length;
    this.stats.sansSignature = this.contrats.filter(c => this.getSignatureStatus(c) === 'none').length;
    this.stats.signatureClient = this.contrats.filter(c => this.getSignatureStatus(c) === 'client').length;
    this.stats.signatureFreelancer = this.contrats.filter(c => this.getSignatureStatus(c) === 'freelancer').length;
    this.stats.doubleSignature = this.contrats.filter(c => this.getSignatureStatus(c) === 'both').length;
  }

  getSignatureStatus(contrat: Contrat): 'none' | 'client' | 'freelancer' | 'both' {
    const hasClientSignature = contrat.signatures?.some(s => s.role === 'CLIENT');
    const hasFreelancerSignature = contrat.signatures?.some(s => s.role === 'PRESTATAIRE') || !!contrat.signatureImage;
    
    if (hasClientSignature && hasFreelancerSignature) return 'both';
    if (hasClientSignature) return 'client';
    if (hasFreelancerSignature) return 'freelancer';
    return 'none';
  }

  getSignatureBadgeClass(status: 'none' | 'client' | 'freelancer' | 'both'): string {
    switch (status) {
      case 'none':
        return 'badge-none';
      case 'client':
        return 'badge-client';
      case 'freelancer':
        return 'badge-freelancer';
      case 'both':
        return 'badge-both';
      default:
        return '';
    }
  }

  getSignatureLabel(status: 'none' | 'client' | 'freelancer' | 'both'): string {
    switch (status) {
      case 'none':
        return 'Aucune signature';
      case 'client':
        return 'Client signé';
      case 'freelancer':
        return 'Freelancer signé';
      case 'both':
        return 'Double signature';
      default:
        return '';
    }
  }

  getStatutBadgeClass(statut: StatutContrat): string {
    switch (statut) {
      case StatutContrat.BROUILLON:
        return 'badge-brouillon';
      case StatutContrat.EN_ATTENTE:
        return 'badge-en-attente';
      case StatutContrat.ACTIF:
        return 'badge-actif';
      case StatutContrat.TERMINE:
        return 'badge-termine';
      case StatutContrat.RESILIE:
        return 'badge-resilie';
      case StatutContrat.LITIGE:
        return 'badge-litige';
      default:
        return '';
    }
  }

  getStatutLabel(statut: StatutContrat): string {
    switch (statut) {
      case StatutContrat.BROUILLON:
        return 'BROUILLON';
      case StatutContrat.EN_ATTENTE:
        return 'EN ATTENTE';
      case StatutContrat.ACTIF:
        return 'ACTIF';
      case StatutContrat.TERMINE:
        return 'TERMINE';
      case StatutContrat.RESILIE:
        return 'RESILIE';
      case StatutContrat.LITIGE:
        return 'LITIGE';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  async telechargerPDF(contrat: Contrat): Promise<void> {
    if (!contrat) return;

    // Load clauses for the contract
    if (contrat.id) {
      try {
        this.selectedContratClauses = await this.clauseService.getClausesByContrat(contrat.id).toPromise();
      } catch (err) {
        console.error('Erreur chargement clauses:', err);
        this.selectedContratClauses = [];
      }
    }

    this.selectedContrat = contrat;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Header with border
    doc.setFillColor(10, 110, 189);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('CONTRAT DE PRESTATION', pageWidth / 2, 25, { align: 'center' });
    
    // Contract number and date
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`N° ${contrat.id} • ${this.formatDate(contrat.dateGeneration)}`, pageWidth / 2, 35, { align: 'center' });

    // Contract title with border
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(contrat.titre, margin, 60);
    doc.setDrawColor(10, 110, 189);
    doc.setLineWidth(1);
    doc.line(margin, 65, pageWidth - margin, 65);

    // Parties section with box
    doc.setFillColor(244, 248, 253);
    doc.roundedRect(margin, 75, contentWidth, 45, 3, 3, 'F');
    doc.setDrawColor(10, 110, 189);
    doc.roundedRect(margin, 75, contentWidth, 45, 3, 3, 'S');
    
    doc.setTextColor(10, 110, 189);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PARTIES PRENANTES', margin, 88);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Client: ID ${contrat.clientId}`, margin, 100);
    doc.text(`Prestataire: ID ${contrat.prestataireId}`, margin, 110);

    // Financial info section with box
    let yPosition = 130;
    doc.setFillColor(244, 248, 253);
    doc.roundedRect(margin, yPosition, contentWidth, 55, 3, 3, 'F');
    doc.setDrawColor(10, 110, 189);
    doc.roundedRect(margin, yPosition, contentWidth, 55, 3, 3, 'S');
    
    doc.setTextColor(10, 110, 189);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMATIONS FINANCIÈRES', margin, yPosition + 13);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Montant total: ${contrat.montant} TND`, margin, yPosition + 25);
    doc.text(`Modalité de paiement: ${contrat.modalitePaiement || 'Non spécifié'}`, margin, yPosition + 35);
    doc.text(`Date de début: ${this.formatDate(contrat.dateDebut)}`, margin, yPosition + 45);
    doc.text(`Date de fin: ${this.formatDate(contrat.dateFin)}`, margin, yPosition + 55);

    // Status badge
    yPosition += 70;
    doc.setFillColor(this.getStatutColor(contrat.statut));
    doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`STATUT: ${this.getStatutLabel(contrat.statut)}`, margin + 10, yPosition + 16);

    // Description section
    if (contrat.description) {
      yPosition += 40;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      doc.setTextColor(10, 110, 189);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('DESCRIPTION', margin, yPosition + 15);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      const splitDescription = doc.splitTextToSize(contrat.description, contentWidth);
      doc.text(splitDescription, margin, yPosition + 25);
      yPosition += 25 + (splitDescription.length * 5) + 15;
    }

    // Clauses section
    if (this.selectedContratClauses.length > 0) {
      doc.addPage();
      yPosition = 50;
      
      doc.setTextColor(10, 110, 189);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('CLAUSES DU CONTRAT', margin, yPosition);
      doc.setDrawColor(10, 110, 189);
      doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);
      
      yPosition += 20;
      this.selectedContratClauses.forEach((clause, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 50;
        }
        
        // Clause box
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'F');
        doc.setDrawColor(209, 213, 219);
        doc.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'S');
        
        doc.setTextColor(10, 110, 189);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${clause.titre}`, margin + 5, yPosition + 12);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitContent = doc.splitTextToSize(clause.contenu, contentWidth - 10);
        doc.text(splitContent, margin + 5, yPosition + 22);
        
        yPosition += 40;
      });
    }

    // Signatures section
    const clientSignature = contrat.signatures?.find(s => s.role === 'CLIENT');
    const freelancerSignatureRecord = contrat.signatures?.find(s => s.role === 'PRESTATAIRE');
    const freelancerSignatureImage = contrat.signatureImage || freelancerSignatureRecord?.signatureImage;
    const clientSignatureImage = clientSignature?.signatureImage;

    if (clientSignature || freelancerSignatureRecord || freelancerSignatureImage || clientSignatureImage) {
      doc.addPage();
      yPosition = 50;
      
      // Signature header
      doc.setFillColor(10, 110, 189);
      doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('SIGNATURES ÉLECTRONIQUES', pageWidth / 2, yPosition + 12, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Document signé le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition + 22, { align: 'center' });
      
      yPosition += 40;

      // Client signature
      if (clientSignature || clientSignatureImage) {
        doc.setFillColor(244, 248, 253);
        doc.roundedRect(margin, yPosition, contentWidth, 90, 3, 3, 'F');
        doc.setDrawColor(10, 110, 189);
        doc.roundedRect(margin, yPosition, contentWidth, 90, 3, 3, 'S');
        
        doc.setTextColor(10, 110, 189);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('SIGNATURE CLIENT', margin + 10, yPosition + 20);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (clientSignature) {
          doc.text(`Signé le: ${this.formatDate(clientSignature.dateSignature || '')}`, margin + 10, yPosition + 35);
          doc.text(`User ID: ${clientSignature.userId}`, margin + 10, yPosition + 45);
        }
        
        // Add signature image if available
        if (clientSignatureImage) {
          doc.addImage(clientSignatureImage, 'PNG', margin + 10, yPosition + 55, contentWidth - 20, 30);
        } else if (clientSignature) {
          doc.setTextColor(150, 150, 150);
          doc.text('(Signature non disponible)', margin + 10, yPosition + 55);
        }
        
        yPosition += 100;
      }

      // Freelancer signature
      if (freelancerSignatureRecord || freelancerSignatureImage) {
        doc.setFillColor(244, 248, 253);
        doc.roundedRect(margin, yPosition, contentWidth, 90, 3, 3, 'F');
        doc.setDrawColor(10, 110, 189);
        doc.roundedRect(margin, yPosition, contentWidth, 90, 3, 3, 'S');
        
        doc.setTextColor(10, 110, 189);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('SIGNATURE FREELANCER', margin + 10, yPosition + 20);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (freelancerSignatureRecord) {
          doc.text(`Signé le: ${this.formatDate(freelancerSignatureRecord.dateSignature || '')}`, margin + 10, yPosition + 35);
          doc.text(`User ID: ${freelancerSignatureRecord.userId}`, margin + 10, yPosition + 45);
        } else {
          doc.text(`Signé le: ${this.formatDate(contrat.dateGeneration || '')}`, margin + 10, yPosition + 35);
        }
        
        // Add signature image
        if (freelancerSignatureImage) {
          doc.addImage(freelancerSignatureImage, 'PNG', margin + 10, yPosition + 55, contentWidth - 20, 30);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('(Signature non disponible)', margin + 10, yPosition + 55);
        }
        
        yPosition += 100;
      }
      
      // Footer
      doc.setFillColor(244, 248, 253);
      doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('Ce document est une signature électronique valide et a le même effet juridique qu\'une signature manuscrite.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('PI MS5 - Plateforme de gestion de contrats', pageWidth / 2, pageHeight - 12, { align: 'center' });
    }

    // Footer on all pages
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(244, 248, 253);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    // Save
    doc.save(`contrat_${contrat.id}_signatures.pdf`);
  }

  getStatutColor(statut: StatutContrat): string {
    switch (statut) {
      case StatutContrat.BROUILLON:
        return '#9CA3AF';
      case StatutContrat.EN_ATTENTE:
        return '#F59E0B';
      case StatutContrat.ACTIF:
        return '#10B981';
      case StatutContrat.TERMINE:
        return '#3B82F6';
      case StatutContrat.RESILIE:
        return '#EF4444';
      case StatutContrat.LITIGE:
        return '#DC2626';
      default:
        return '#9CA3AF';
    }
  }
}
