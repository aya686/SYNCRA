import { Component, OnInit } from '@angular/core';
import { FormationService } from '../../services/formation.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { FormationDisplay } from '../../../shared/models/formation.model';

@Component({
    selector: 'app-formation-list',
    templateUrl: './formation-list.component.html',
    styleUrls: ['./formation-list.component.css'],
    standalone: false
})
export class FormationListComponent implements OnInit {
  formations: FormationDisplay[] = [];
  filteredFormations: FormationDisplay[] = [];
  formationSessions: { [key: number]: any[] } = {};
  searchTerm: string = '';
  niveauFilter: string = '';
  loading: boolean = false;

  get totalFormations(): number {
    return this.formations.length;
  }

  get avanceCount(): number {
    return this.formations.filter(f => f.niveau === 'avance').length;
  }

  get certifieCount(): number {
    return this.formations.filter(f => f.certificate).length;
  }

  constructor(
    private formationService: FormationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.filteredFormations = formations;
        this.loading = false;
        // Charger les sessions pour chaque formation
        this.loadAllSessions();
        this.notificationService.success(`${formations.length} formations chargées`);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Impossible de charger les formations');
        this.loading = false;
      }
    });
  }

  // Charger les sessions pour toutes les formations
  loadAllSessions(): void {
    this.formations.forEach(formation => {
      this.formationService.getSessions(formation.id).subscribe({
        next: (sessions) => {
          this.formationSessions[formation.id] = sessions;
          console.log(`Sessions pour ${formation.titre}:`, sessions);
        },
        error: (err) => {
          console.error(`Erreur chargement sessions pour formation ${formation.id}:`, err);
          this.formationSessions[formation.id] = [];
        }
      });
    });
  }

  filterFormations(): void {
    this.filteredFormations = this.formations.filter(formation => {
      const matchesSearch = !this.searchTerm || 
        formation.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        formation.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesNiveau = !this.niveauFilter || formation.niveau === this.niveauFilter;
      return matchesSearch && matchesNiveau;
    });
  }

  deleteFormation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.loadFormations();
          this.notificationService.success('Formation supprimée avec succès');
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.notificationService.error('Impossible de supprimer la formation');
        }
      });
    }
  }

  getNiveauLabel(niveau: string): string {
    const labels: {[key: string]: string} = {
      'debutant': 'Débutant',
      'intermediaire': 'Intermédiaire',
      'avance': 'Avancé'
    };
    return labels[niveau] || niveau;
  }
}