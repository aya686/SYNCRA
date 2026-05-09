import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Contrat, Clause, StatutContrat } from '../../models/contrat.model';
import { ContratService } from '../../services/contrat.service';
import { ClauseService } from '../../services/clause.service';
import { LitigeService } from '../../services/litige.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-detail-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detail-contrat.component.html',
  styleUrls: ['./detail-contrat.component.scss']
})
export class DetailContratComponent implements OnInit {
  contratId: number | null = null;
  contrat: Contrat | null = null;
  clauses: Clause[] = [];
  loading = false;
  error = '';

  // Current user ID (TODO: Get from auth)
  currentUserId = 1;
  isAdminUser = true; // TODO: Get from auth

  // Signature properties
  @ViewChild('signatureCanvas', { static: false }) signatureCanvas!: ElementRef<HTMLCanvasElement>;
  showSignatureModal = false;
  isDrawing = false;
  signatureImage: string | null = null;
  private ctx!: CanvasRenderingContext2D;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService,
    private clauseService: ClauseService,
    private litigeService: LitigeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contratId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('=== DÉTAIL CONTRAT INIT ===');
    console.log('ID du contrat depuis route:', this.contratId);
    if (this.contratId) {
      this.loadContrat();
    } else {
      console.error('❌ ID du contrat non trouvé');
      this.error = 'ID du contrat non trouvé';
    }
  }

  loadContrat(): void {
    console.log('=== CHARGEMENT DU CONTRAT ===');
    console.log('ID à charger:', this.contratId);
    this.loading = true;
    this.contratService.getContratById(this.contratId!).subscribe({
      next: (data) => {
        console.log('✅ Contrat reçu:', data);
        this.contrat = data;
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        this.loadClauses();
      },
      error: (err) => {
        console.error('❌ Erreur chargement contrat:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.error = `Erreur lors du chargement du contrat (Status ${err.status}): ${err.error?.message || err.message || 'Erreur inconnue'}`;
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  loadClauses(): void {
    if (this.contratId) {
      this.clauseService.getClausesByContrat(this.contratId).subscribe({
        next: (data) => {
          this.clauses = data;
        },
        error: (err) => {
          console.error('Erreur chargement clauses:', err);
        }
      });
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

  signerContrat(): void {
    // Open signature modal instead of signing directly
    this.showSignatureModal = true;
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  initCanvas(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000';
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event as MouseEvent).clientX - rect.left || (event as TouchEvent).touches[0].clientX - rect.left;
    const y = (event as MouseEvent).clientY - rect.top || (event as TouchEvent).touches[0].clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (event as MouseEvent).clientX - rect.left || (event as TouchEvent).touches[0].clientX - rect.left;
    const y = (event as MouseEvent).clientY - rect.top || (event as TouchEvent).touches[0].clientY - rect.top;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing(): void {
    this.isDrawing = false;
    this.ctx.closePath();
  }

  clearSignature(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  confirmSignature(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.signatureImage = canvas.toDataURL('image/png');

    // Save signature to contract object for persistence
    if (this.contrat) {
      this.contrat.signatureImage = this.signatureImage;
    }

    this.closeSignatureModal();

    // Now sign the contract with the signature
    if (!this.contratId || !this.currentUserId) return;

    this.contratService.signerContrat(this.contratId, this.currentUserId, this.signatureImage).subscribe({
      next: (response) => {
        console.log('✅ Contrat signé avec succès:', response);
        // Reload contract from backend to ensure persistence
        this.loadContrat();
      },
      error: (err) => {
        console.error('❌ Erreur signature contrat:', err);
        this.error = 'Erreur lors de la signature du contrat';
      }
    });
  }

  closeSignatureModal(): void {
    this.showSignatureModal = false;
    this.signatureImage = null;
  }

  ouvrirLitige(): void {
    // TODO: Implement dispute opening modal
    console.log('Ouvrir litige pour contrat', this.contratId);
  }

  telechargerPDF(): void {
    if (!this.contrat) return;

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
    doc.text(`N° ${this.contrat.id} • ${this.formatDate(this.contrat.dateGeneration)}`, pageWidth / 2, 35, { align: 'center' });

    // Contract title with border
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(this.contrat.titre, margin, 60);
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
    doc.text(`Client: ID ${this.contrat.clientId}`, margin, 100);
    doc.text(`Prestataire: ID ${this.contrat.prestataireId}`, margin, 110);

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
    doc.text(`Montant total: ${this.contrat.montant} TND`, margin, yPosition + 25);
    doc.text(`Modalité de paiement: ${this.contrat.modalitePaiement || 'Non spécifié'}`, margin, yPosition + 35);
    doc.text(`Date de début: ${this.formatDate(this.contrat.dateDebut)}`, margin, yPosition + 45);
    doc.text(`Date de fin: ${this.formatDate(this.contrat.dateFin)}`, margin, yPosition + 55);

    // Status badge
    yPosition += 70;
    doc.setFillColor(this.getStatutColor(this.contrat.statut));
    doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`STATUT: ${this.getStatutLabel(this.contrat.statut)}`, margin + 10, yPosition + 16);

    // Description section
    if (this.contrat.description) {
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
      const splitDescription = doc.splitTextToSize(this.contrat.description, contentWidth);
      doc.text(splitDescription, margin, yPosition + 25);
      yPosition += 25 + (splitDescription.length * 5) + 15;
    }

    // Clauses section
    if (this.clauses.length > 0) {
      doc.addPage();
      yPosition = 50;
      
      doc.setTextColor(10, 110, 189);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('CLAUSES DU CONTRAT', margin, yPosition);
      doc.setDrawColor(10, 110, 189);
      doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);
      
      yPosition += 20;
      this.clauses.forEach((clause, index) => {
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

    // Signature section
    if (this.contrat.signatureImage) {
      doc.addPage();
      
      // Signature header
      doc.setFillColor(10, 110, 189);
      doc.roundedRect(margin, 40, contentWidth, 30, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('SIGNATURE ÉLECTRONIQUE', pageWidth / 2, 52, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Signé le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 62, { align: 'center' });
      
      // Signature image with border
      doc.setDrawColor(10, 110, 189);
      doc.setLineWidth(2);
      doc.roundedRect(margin, 80, contentWidth, 100, 5, 5, 'S');
      doc.addImage(this.contrat.signatureImage, 'PNG', margin + 10, 90, contentWidth - 20, 80);
      
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
    doc.save(`contrat_${this.contrat.id}.pdf`);
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

  retour(): void {
    this.router.navigate(['/contrats/mes-contrats']);
  }

  canSigner(): boolean {
    if (!this.contrat) return false;
    // Check if current user hasn't signed yet
    return this.contrat.statut === StatutContrat.BROUILLON ||
           this.contrat.statut === StatutContrat.EN_ATTENTE;
  }

  isAdmin(): boolean {
    return this.isAdminUser;
  }

  resilierContrat(): void {
    if (!this.contratId) return;

    this.contratService.resilierContrat(this.contratId).subscribe({
      next: (response) => {
        console.log('✅ Contrat résilié avec succès:', response);
        this.contrat = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur résiliation contrat:', err);
        this.error = 'Erreur lors de la résiliation du contrat';
      }
    });
  }
}
