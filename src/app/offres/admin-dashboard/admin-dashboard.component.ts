import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Offre, StatutOffre } from '../../models/offre.model';
import { Categorie } from '../../models/categorie.model';
import { OffreService } from '../../services/offre.service';
import { CategorieService } from '../../services/categorie.service';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  offres: Offre[] = [];
  categories: Categorie[] = [];
  loading = false;
  error = '';
  
  // Statistiques
  stats = {
    totalOffres: 0,
    offresActives: 0,
    offresCloturees: 0,
    offresSuspectes: 0,
    budgetMoyen: 0,
    offresParCategorie: [] as {nom: string, count: number}[]
  };

  // Filtres
  selectedStatut: StatutOffre | '' = '';
  selectedCategorie: number | null = null;
  selectedEtatClient: boolean | null = null; // null = tous, true = suspectes, false = normales
  searchText = '';

  constructor(
    private offreService: OffreService,
    private categorieService: CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllOffres();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  loadAllOffres(): void {
    this.loading = true;
    this.error = '';
    
    this.offreService.getAllOffres().subscribe({
      next: (data) => {
        this.offres = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
        console.error(err);
      }
    });
  }

  calculateStats(): void {
    this.stats.totalOffres = this.offres.length;
    this.stats.offresActives = this.offres.filter(o => o.statut === StatutOffre.ACTIVE).length;
    this.stats.offresCloturees = this.offres.filter(o => o.statut === StatutOffre.CLOTUREE).length;
    this.stats.offresSuspectes = this.offres.filter(o => o.estSuspecte === true).length;

    // Budget moyen
    const budgets = this.offres.map(o => o.budgetMin);
    this.stats.budgetMoyen = budgets.length > 0
      ? budgets.reduce((a, b) => a + b, 0) / budgets.length
      : 0;

    // Offres par catégorie
    const categoriesMap = new Map<string, number>();
    this.offres.forEach(o => {
      const catName = o.categorieNom || 'Non catégorisé';
      categoriesMap.set(catName, (categoriesMap.get(catName) || 0) + 1);
    });
    this.stats.offresParCategorie = Array.from(categoriesMap.entries())
      .map(([nom, count]) => ({ nom, count }));
  }

  getFilteredOffres(): Offre[] {
    return this.offres.filter(o => {
      const matchStatut = !this.selectedStatut || o.statut === this.selectedStatut;
      const matchCategorie = !this.selectedCategorie || o.categorieId === this.selectedCategorie;
      const matchSearch = !this.searchText ||
        o.titre.toLowerCase().includes(this.searchText.toLowerCase()) ||
        o.description.toLowerCase().includes(this.searchText.toLowerCase());
      const matchEtatClient = this.selectedEtatClient === null || o.estSuspecte === this.selectedEtatClient;
      return matchStatut && matchCategorie && matchSearch && matchEtatClient;
    });
  }

  modifierOffre(offre: Offre): void {
    this.router.navigate(['/offres/modifier', offre.id]);
  }

  suspendreOffre(offre: Offre): void {
    // Implémentation future
    alert('Fonctionnalité de suspension à implémenter');
  }

  changerStatut(offre: Offre, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nouveauStatut = selectElement.value as StatutOffre;

    if (!nouveauStatut || nouveauStatut === offre.statut) {
      return;
    }
    if (confirm(`Voulez-vous vraiment changer le statut de l'offre "${offre.titre}" vers ${nouveauStatut} ?`)) {
      this.offreService.updateStatut(offre.id!, nouveauStatut).subscribe({
        next: () => {
          this.loadAllOffres();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors du changement de statut';
        }
      });
    }
  }

  supprimerOffre(offre: Offre): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${offre.titre}" ?`)) {
      this.offreService.deleteOffre(offre.id!).subscribe({
        next: () => this.loadAllOffres(),
        error: (err) => this.error = err.error?.message || 'Erreur lors de la suppression'
      });
    }
  }

  getStatutLabel(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutLabel(statut) : '';
  }

  getStatutBadgeClass(statut: StatutOffre): string {
    return this.offreService.getStatutBadgeClass(statut);
  }

  getCategorieNom(offre: Offre): string {
    if (offre.categorie?.nom) return offre.categorie.nom;
    if (offre.categorieNom) return offre.categorieNom;
    return 'Non catégorisé';
  }

  exportPDF(): void {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 35, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Rapport des Offres', 14, 20);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`TAIB Marketplace - Dashboard Administratif`, 14, 28);
    
    // Date
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 42);
    
    // Stats Section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 50, 182, 35, 3, 3, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Statistiques Globales', 20, 58);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const statsData = [
      { label: 'Total Offres:', value: this.stats.totalOffres },
      { label: 'Offres Actives:', value: this.stats.offresActives },
      { label: 'Offres Clôturées:', value: this.stats.offresCloturees },
      { label: 'Budget Moyen:', value: `${this.stats.budgetMoyen.toFixed(2)} TND` }
    ];
    
    statsData.forEach((stat, index) => {
      const x = 20 + (index % 2) * 95;
      const y = 66 + Math.floor(index / 2) * 8;
      doc.text(`${stat.label} ${stat.value}`, x, y);
    });
    
    // Table Section
    let y = 95;
    
    // Table header
    doc.setFillColor(59, 130, 246);
    doc.rect(14, y, 182, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ID', 16, y + 7);
    doc.text('Titre', 30, y + 7);
    doc.text('Catégorie', 90, y + 7);
    doc.text('Budget', 130, y + 7);
    doc.text('Statut', 165, y + 7);
    
    // Table rows
    y += 18;
    const filteredOffres = this.getFilteredOffres();
    filteredOffres.forEach((offre, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
        
        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(14, y, 182, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('ID', 16, y + 7);
        doc.text('Titre', 30, y + 7);
        doc.text('Catégorie', 90, y + 7);
        doc.text('Budget', 130, y + 7);
        doc.text('Statut', 165, y + 7);
        
        y += 18;
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, 182, 8, 'F');
      }
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(String(offre.id || ''), 16, y);
      doc.text((offre.titre || '').substring(0, 25), 30, y);
      doc.text(this.getCategorieNom(offre).substring(0, 15), 90, y);
      doc.text(`${offre.budgetMin} TND`, 130, y);
      doc.text(this.getStatutLabel(offre.statut), 165, y);
      
      y += 8;
    });
    
    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('© 2026 TAIB Marketplace - Document confidentiel', 105, 290, { align: 'center' });
    
    doc.save('rapport-offres.pdf');
  }

  async exportOffrePDF(offre: Offre): Promise<void> {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Fiche Offre', 14, 18);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Référence: #${offre.id}`, 14, 28);
    
    // Date
    doc.setFontSize(9);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 36);
    
    // Offer details section
    let y = 55;
    
    // Title section
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y - 5, 120, 30, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(14, y - 5, 120, 30, 3, 3, 'S');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Titre du poste', 20, y + 5);
    
    doc.setFontSize(13);
    doc.setFont(undefined, 'normal');
    const titleLines = doc.splitTextToSize(offre.titre || '', 110);
    titleLines.forEach((line: string, index: number) => {
      doc.text(line, 20, y + 15 + (index * 8));
    });
    y += 40;
    
    // Info grid with better spacing and clarity
    const infoData = [
      { label: 'Catégorie', value: this.getCategorieNom(offre) },
      { label: 'Budget Min', value: offre.budgetMin ? `${offre.budgetMin} TND` : 'Non spécifié' },
      { label: 'Budget Max', value: offre.budgetMax ? `${offre.budgetMax} TND` : 'Non spécifié' },
      { label: 'Statut', value: this.getStatutLabel(offre.statut) },
      { label: 'Date Publication', value: offre.datePublication ? new Date(offre.datePublication).toLocaleDateString('fr-FR') : 'Non spécifié' },
      { label: 'Deadline', value: offre.deadline ? new Date(offre.deadline).toLocaleDateString('fr-FR') : 'Non spécifié' },
      { label: 'Nombre de postes', value: offre.nombrePostes ? String(offre.nombrePostes) : 'Non spécifié' },
      { label: 'Publieur ID', value: offre.publieurId ? String(offre.publieurId) : 'Non spécifié' }
    ];
    
    infoData.forEach((info, index) => {
      const x = 14 + (index % 2) * 95;
      const yPos = y + Math.floor(index / 2) * 18;
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yPos - 5, 90, 16, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, yPos - 5, 90, 16, 3, 3, 'S');
      
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(info.label, x + 6, yPos + 2);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(info.value, x + 6, yPos + 10);
    });
    
    y += 75;
    
    // Description section
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y - 5, 120, 100, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(14, y - 5, 120, 100, 3, 3, 'S');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Description du poste', 20, y + 5);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const descriptionLines = doc.splitTextToSize(offre.description || '', 110);
    let descY = y + 12;
    descriptionLines.forEach((line: string) => {
      if (descY > y + 95) {
        doc.addPage();
        descY = 20;
      }
      doc.text(line, 20, descY);
      descY += 6;
    });
    
    // Generate QR Code with user-friendly text format
    const qrText = `OFFRE #${offre.id}\n\nTitre: ${offre.titre}\nCatégorie: ${this.getCategorieNom(offre)}\nBudget: ${offre.budgetMin} - ${offre.budgetMax} TND\nStatut: ${this.getStatutLabel(offre.statut)}\nDeadline: ${offre.deadline ? new Date(offre.deadline).toLocaleDateString('fr-FR') : 'Non spécifié'}`;
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrText, {
        width: 80,
        margin: 1,
        color: {
          dark: '#3b82f6',
          light: '#ffffff'
        }
      });
      
      // Add QR Code on the right side
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(145, 55, 50, 50, 3, 3, 'F');
      doc.setDrawColor(59, 130, 246);
      doc.roundedRect(145, 55, 50, 50, 3, 3, 'S');
      doc.addImage(qrCodeDataURL, 'PNG', 150, 60, 40, 40);
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('Scanner pour', 170, 110, { align: 'center' });
      doc.text('voir les détails', 170, 115, { align: 'center' });
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
    }
    
    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('© 2026 TAIB Marketplace - Document confidentiel', 105, 290, { align: 'center' });
    
    doc.save(`offre-${offre.id}.pdf`);
  }
}
