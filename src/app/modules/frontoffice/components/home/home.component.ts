import { Component, OnInit } from '@angular/core';
import { PublicEventService } from '../../services/public-event.service';
import { PublicFormationService } from '../../services/public-formation.service';
import { ThemeService } from '../../../shared/services/theme.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  upcomingEvents: any[] = [];
  popularFormations: any[] = [];
  loading = true;
  isDarkMode = false;
   navScrolled = false;
  isSidebarCollapsed = false;
  mobileMenuOpen = false;
  private loadedCount = 0;
   toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  


  stats = {
    events: 0,
    formations: 0,
    participants: 1250,
    formateurs: 45
  };

  statsList: any[] = [];

  steps = [
    { icon: '🔍', title: 'Parcourez le catalogue', desc: 'Explorez nos événements et formations selon vos centres d\'intérêt et votre niveau.' },
    { icon: '📝', title: 'Inscrivez-vous', desc: 'Réservez votre place en quelques clics, gratuitement ou à tarif préférentiel.' },
    { icon: '🏆', title: 'Progressez', desc: 'Participez, apprenez et obtenez des certificats reconnus par les professionnels.' }
  ];

  constructor(
    private eventService: PublicEventService,
    private formationService: PublicFormationService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });

  }
toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  loadData(): void {
    this.loading = true;
    this.loadedCount = 0;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.upcomingEvents = events.slice(0, 3);
        this.stats.events = events.length;
        this.finishLoading();
      },
      error: () => this.finishLoading()
    });

    this.formationService.getFormations().subscribe({
      next: (formations) => {
        this.popularFormations = formations.slice(0, 4);
        this.stats.formations = formations.length;
        this.finishLoading();
      },
      error: () => this.finishLoading()
    });
  }

  finishLoading(): void {
    this.loadedCount++;
    if (this.loadedCount >= 2) {
      this.loading = false;
      this.buildStats();
    }
  }

  buildStats(): void {
    this.statsList = [
      { icon: '📅', value: this.stats.events,       label: 'Événements',   fill: '65%' },
      { icon: '🎓', value: this.stats.formations,    label: 'Formations',   fill: '50%' },
      { icon: '👥', value: this.stats.participants,  label: 'Participants', fill: '80%' },
      { icon: '🏅', value: this.stats.formateurs,    label: 'Formateurs',   fill: '40%' },
    ];
  }
}
