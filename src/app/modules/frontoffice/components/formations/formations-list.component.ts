import { Component, OnInit } from '@angular/core';
import { PublicFormationService } from '../../services/public-formation.service';
import { ThemeService } from '../../../shared/services/theme.service';

@Component({
    selector: 'app-formations-list',
    templateUrl: './formations-list.component.html',
    styleUrls: ['./formations-list.component.css'],
    standalone: false
})
export class FormationsListComponent implements OnInit {
  formations: any[] = [];
  filteredFormations: any[] = [];
  searchTerm: string = '';
  niveauFilter: string = '';
  loading = true;
  isDarkMode = false;


  constructor(private formationService: PublicFormationService, private themeService: ThemeService
) {}

  ngOnInit(): void {
    this.loadFormations();
    this.themeService.theme$.subscribe(theme => { this.isDarkMode = theme === 'dark';});
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.filteredFormations = formations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
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

  resetFilters(): void {
    this.searchTerm = '';
    this.niveauFilter = '';
    this.filterFormations();
  }
toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  getCertifiedCount(): number {
    return this.formations.filter(f => f.certificate).length;
  }
}