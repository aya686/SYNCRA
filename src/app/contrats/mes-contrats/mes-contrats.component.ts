import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Contrat, StatutContrat } from '../../models/contrat.model';
import { ContratService } from '../../services/contrat.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-mes-contrats',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mes-contrats.component.html',
  styleUrls: ['./mes-contrats.component.scss']
})
export class MesContratsComponent implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  loading = false;
  error = '';

  // Search
  searchTitre = '';

  // Statistics
  stats = {
    total: 0,
    enCours: 0,
    termines: 0,
    enLitige: 0
  };

  // Current user ID (TODO: Get from auth)
  currentUserId = 1;

  constructor(private contratService: ContratService) {}

  ngOnInit(): void {
    this.loadContrats();
  }

  loadContrats(): void {
    this.loading = true;
    console.log('Chargement des contrats...');
    // Temporarily use getAllContrats to check if contracts are generated
    this.contratService.getAllContrats().subscribe({
      next: (data) => {
        console.log('Tous les contrats récupérés:', data);
        console.log('Nombre de contrats:', data.length);
        this.contrats = data;
        this.applySearch();
        this.calculateStats();
        this.loading = false;
        console.log('Chargement terminé, loading =', this.loading);
      },
      error: (err) => {
        console.error('Erreur chargement contrats:', err);
        this.error = 'Erreur lors du chargement de vos contrats';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    if (!this.searchTitre) {
      this.filteredContrats = this.contrats;
      return;
    }

    const searchTerm = this.searchTitre.toLowerCase();
    this.filteredContrats = this.contrats.filter(contrat =>
      contrat.titre.toLowerCase().includes(searchTerm)
    );
  }

  onSearchChange(): void {
    this.applySearch();
  }

  calculateStats(): void {
    this.stats.total = this.contrats.length;
    this.stats.enCours = this.contrats.filter(c => c.statut === StatutContrat.ACTIF || c.statut === StatutContrat.EN_ATTENTE).length;
    this.stats.termines = this.contrats.filter(c => c.statut === StatutContrat.TERMINE).length;
    this.stats.enLitige = this.contrats.filter(c => c.statut === StatutContrat.LITIGE).length;
  }

  getPartenaireName(contrat: Contrat): string {
    if (contrat.clientId === this.currentUserId) {
      return `Prestataire #${contrat.prestataireId}`;
    } else {
      return `Client #${contrat.clientId}`;
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  telechargerPDF(contrat: Contrat): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(`Contrat #${contrat.id}`, 20, 20);

    // Contract title
    doc.setFontSize(16);
    doc.text(contrat.titre, 20, 35);

    // Date generation
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le: ${this.formatDate(contrat.dateGeneration)}`, 20, 45);

    // Parties
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Parties Prenantes:', 20, 60);
    doc.setFontSize(10);
    doc.text(`Client ID: ${contrat.clientId}`, 20, 70);
    doc.text(`Prestataire ID: ${contrat.prestataireId}`, 20, 78);

    // Financial info
    doc.setFontSize(12);
    doc.text('Informations Financières:', 20, 95);
    doc.setFontSize(10);
    doc.text(`Montant: ${contrat.montant} TND`, 20, 105);
    doc.text(`Modalité Paiement: ${contrat.modalitePaiement || 'Non spécifié'}`, 20, 113);
    doc.text(`Date Début: ${this.formatDate(contrat.dateDebut)}`, 20, 121);
    doc.text(`Date Fin: ${this.formatDate(contrat.dateFin)}`, 20, 129);

    // Status
    doc.setFontSize(12);
    doc.text(`Statut: ${contrat.statut}`, 20, 146);

    // Description
    if (contrat.description) {
      doc.setFontSize(12);
      doc.text('Description:', 20, 163);
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(contrat.description, 170);
      doc.text(splitDescription, 20, 173);
    }

    // Save
    doc.save(`contrat_${contrat.id}.pdf`);
  }
}
