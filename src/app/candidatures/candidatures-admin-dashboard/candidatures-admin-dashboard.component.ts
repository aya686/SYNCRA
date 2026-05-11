import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Candidature, StatutCandidature } from '../../models/candidature.model';
import { CandidatureService } from '../../services/candidature.service';
import { AiCvService } from '../../services/ai-cv.service';
import { ContratService } from '../../services/contrat.service';

@Component({
  selector: 'app-candidatures-admin-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './candidatures-admin-dashboard.component.html',
  styleUrls: ['./candidatures-admin-dashboard.component.scss']
})
export class CandidaturesAdminDashboardComponent implements OnInit {
  candidatures: Candidature[] = [];
  loading = false;
  error = '';
  filterStatut: StatutCandidature | null = null;
  selectedOffreId: number | null = null;
  selectedCandidature: Candidature | null = null;
  stats = {
    total: 0,
    enAttente: 0,
    enRevision: 0,
    shortlist: 0,
    acceptee: 0,
    refusee: 0
  };

  constructor(
    private candidatureService: CandidatureService,
    public aiCvService: AiCvService,
    private contratService: ContratService
  ) {}

  ngOnInit(): void {
    this.loadAllCandidatures();
  }

  loadAllCandidatures(): void {
    this.loading = true;
    this.candidatureService.getAllCandidatures().subscribe({
      next: (data) => {
        console.log('Candidatures reçues:', data);
        data.forEach(c => {
          console.log(`Candidature ID=${c.id}, Statut="${c.statut}", Type=${typeof c.statut}`);
        });
        this.candidatures = data;
        setTimeout(() => {
          this.calculateStats();
          this.loading = false;
        }, 0);
      },
      error: (err) => {
        console.error('Erreur chargement candidatures:', err);
        this.error = 'Erreur lors du chargement des candidatures';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.candidatures.length;
    this.stats.enAttente = this.candidatures.filter(c => c.statut === StatutCandidature.EN_ATTENTE).length;
    this.stats.enRevision = this.candidatures.filter(c => c.statut === StatutCandidature.EN_REVISION).length;
    this.stats.shortlist = this.candidatures.filter(c => c.statut === StatutCandidature.SHORTLIST).length;
    this.stats.acceptee = this.candidatures.filter(c => c.statut === StatutCandidature.ACCEPTEE).length;
    this.stats.refusee = this.candidatures.filter(c => c.statut === StatutCandidature.REFUSEE).length;
  }

  applyFilters(): Candidature[] {
    let filtered = this.candidatures;
    
    if (this.filterStatut) {
      filtered = filtered.filter(c => c.statut === this.filterStatut);
    }
    
    if (this.selectedOffreId) {
      filtered = filtered.filter(c => c.offre?.id === this.selectedOffreId);
    }
    
    return filtered;
  }

  get filteredCandidatures(): Candidature[] {
    return this.applyFilters();
  }

  accepter(id: number): void {
    console.log('=== CLICK SUR BOUTON ACCEPTER ===');
    console.log('ID candidature:', id);
    console.log('Tentative d\'accepter candidature ID:', id);
    this.candidatureService.accepterCandidature(id).subscribe({
      next: (response) => {
        console.log('✅ Candidature acceptée avec succès:', response);
        // Générer automatiquement le contrat après acceptation
        this.contratService.genererContrat(id).subscribe({
          next: (contrat) => {
            console.log('✅ Contrat généré avec succès:', contrat);
            this.loadAllCandidatures();
          },
          error: (err) => {
            console.error('❌ Erreur génération contrat:', err);
            console.error('Status:', err.status);
            console.error('Error body:', err.error);
            // Recharger quand même les candidatures
            this.loadAllCandidatures();
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur acceptation:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
      }
    });
  }

  refuser(id: number): void {
    console.log('=== CLICK SUR BOUTON REFUSER ===');
    console.log('ID candidature:', id);
    console.log('Tentative de refuser candidature ID:', id);
    this.candidatureService.refuserCandidature(id).subscribe({
      next: (response) => {
        console.log('✅ Candidature refusée avec succès:', response);
        this.loadAllCandidatures();
      },
      error: (err) => {
        console.error('❌ Erreur refus:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
      }
    });
  }

  shortlist(id: number): void {
    console.log('=== CLICK SUR BOUTON SHORTLIST ===');
    console.log('ID candidature:', id);
    console.log('Tentative de mettre en shortlist candidature ID:', id);
    this.candidatureService.mettreEnShortlist(id).subscribe({
      next: (response) => {
        console.log('✅ Candidature mise en shortlist avec succès:', response);
        this.loadAllCandidatures();
      },
      error: (err) => {
        console.error('❌ Erreur shortlist:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
      }
    });
  }

  resetFilters(): void {
    this.filterStatut = null;
    this.selectedOffreId = null;
  }

  getStatutLabel(statut: StatutCandidature): string {
    return this.candidatureService.getStatutLabel(statut);
  }

  getStatutBadgeClass(statut: StatutCandidature): string {
    return this.candidatureService.getStatutBadgeClass(statut);
  }

  peutShortlist(candidature: Candidature): boolean {
    const statutStr = String(candidature.statut).toUpperCase();
    const enAttenteStr = String(StatutCandidature.EN_ATTENTE).toUpperCase();
    const result = statutStr === enAttenteStr;
    console.log(`peutShortlist: statut="${candidature.statut}" (${statutStr}) vs "${StatutCandidature.EN_ATTENTE}" (${enAttenteStr}) = ${result}`);
    return result;
  }

  peutAccepter(candidature: Candidature): boolean {
    const statutStr = String(candidature.statut).toUpperCase();
    const enAttenteStr = String(StatutCandidature.EN_ATTENTE).toUpperCase();
    const shortlistStr = String(StatutCandidature.SHORTLIST).toUpperCase();
    const result = statutStr === enAttenteStr || statutStr === shortlistStr;
    console.log(`peutAccepter: statut="${candidature.statut}" (${statutStr}) = ${result}`);
    return result;
  }

  peutRefuser(candidature: Candidature): boolean {
    const statutStr = String(candidature.statut).toUpperCase();
    const enAttenteStr = String(StatutCandidature.EN_ATTENTE).toUpperCase();
    const shortlistStr = String(StatutCandidature.SHORTLIST).toUpperCase();
    const result = statutStr === enAttenteStr || statutStr === shortlistStr;
    console.log(`peutRefuser: statut="${candidature.statut}" (${statutStr}) = ${result}`);
    return result;
  }

  voirDetailsIA(candidature: Candidature): void {
    this.selectedCandidature = candidature;
  }

  closeModal(): void {
    this.selectedCandidature = null;
  }
}
