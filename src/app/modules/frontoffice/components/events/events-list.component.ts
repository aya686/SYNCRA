import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PublicEventService } from '../../services/public-event.service';
import { ThemeService } from '../../../shared/services/theme.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit, OnDestroy {
  events: any[] = [];
  filteredEvents: any[] = [];
  loading = true;
  isDarkMode = false;

  // Filtres
  searchQuery: string = '';
  activeType: string = '';
  sortKey: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  eventTypes: string[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  
  // Statistiques
  totalEvents: number = 0;
  upcomingEvents: number = 0;
  pastEvents: number = 0;
  
  private subscription: Subscription | null = null;
    private themeSubscription: Subscription | null = null;


  constructor(private eventService: PublicEventService,private themeService: ThemeService ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadEvents(): void {
    this.loading = true;
    this.subscription = this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events.map(event => ({
          ...event,
          organisateur: 'Event&Formation',
          isUpcoming: new Date(event.dateDebut) > new Date()
        }));
        
        this.calculateStats();
        this.extractEventTypes();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalEvents = this.events.length;
    this.upcomingEvents = this.events.filter(e => e.isUpcoming).length;
    this.pastEvents = this.events.filter(e => !e.isUpcoming).length;
  }

  extractEventTypes(): void {
    const types = new Set<string>();
    this.events.forEach(event => {
      if (event.type) types.add(event.type);
    });
    this.eventTypes = Array.from(types);
  }

  applyFilters(): void {
    let filtered = [...this.events];
    
    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.titre?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.lieu?.toLowerCase().includes(query) ||
        event.organisateur?.toLowerCase().includes(query)
      );
    }
    
    // Filtre par type
    if (this.activeType) {
      filtered = filtered.filter(event => event.type === this.activeType);
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortKey) {
        case 'date':
          comparison = new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
          break;
        case 'titre':
          comparison = (a.titre || '').localeCompare(b.titre || '');
          break;
        case 'places':
          comparison = (a.placesDisponibles || 0) - (b.placesDisponibles || 0);
          break;
        case 'prix':
          comparison = (a.prix || 0) - (b.prix || 0);
          break;
        default:
          comparison = 0;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  filterByType(type: string): void {
    this.activeType = type;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeType = '';
    this.sortKey = 'date';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  getPaginatedEvents(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}