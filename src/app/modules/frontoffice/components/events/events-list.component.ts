import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicEventService } from '../../services/public-event.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { FavoritesService } from '../../../shared/services/favorites.service';
import { DataCollectorService } from '../../../shared/services/data-collector.service';
import { AuthService } from '../../../shared/services/auth.service';
import { UserType } from '../../../shared/components/user-type-modal/user-type-modal.component';
import { environment } from '../../../shared/environments/environments';

@Component({
    selector: 'app-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.scss'],
    standalone: false
})
export class EventsListComponent implements OnInit, OnDestroy {
  events: any[] = [];
  filteredEvents: any[] = [];
  loading = true;
  isDarkMode = false;
  navScrolled = false;
  isSidebarCollapsed = false;
  mobileMenuOpen = false;
  favoritesMap: Map<number, boolean> = new Map();
  favoritesLoading: Map<number, boolean> = new Map();
  showUserTypeModal = false; 
  pendingEventForClick: any = null;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

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


  constructor(private eventService: PublicEventService,private themeService: ThemeService,
     private favoritesService: FavoritesService,private dataCollector: DataCollectorService,
  private authService: AuthService
   
   ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
    this.favoritesService.favorites$.subscribe(favorites => {
    this.favoritesMap.clear();
    favorites.forEach(f => {
      this.favoritesMap.set(f.evenementId, true);
    });
  });
      this.checkUserTypePreference();

  }
  checkUserTypePreference(): void {
    const savedType = localStorage.getItem('user_type');
    if (!savedType) {
      // Afficher la modale après 3 secondes (ou immédiatement)
      setTimeout(() => {
        this.showUserTypeModal = true;
      }, 1000);
    }
  }
   onUserTypeSelected(userType: UserType): void {
    // Sauvegarder dans localStorage
    localStorage.setItem('user_type', userType);
    
    // Mettre à jour l'utilisateur courant
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Sauvegarder le type dans le user (ajoutez cette propriété à votre interface User)
      currentUser.userType = userType;
      localStorage.setItem('temp_user', JSON.stringify(currentUser));
    }
    
    console.log(`✅ Type utilisateur sélectionné: ${userType}`);
    
    // Envoyer la donnée au backend pour enrichir le profil
    this.sendUserTypeToBackend(userType);
  }
  
  // ✅ Quand l'utilisateur skip
  onUserTypeSkipped(): void {
    console.log('Utilisateur a choisi de répondre plus tard');
  }
  
  // ✅ Envoyer le type utilisateur au backend
  sendUserTypeToBackend(userType: string): void {
    // Optionnel: appeler une API pour sauvegarder le type
    // this.http.post('/api/users/type', { userType }).subscribe();
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
  // events-list.component.ts - Ajoutez cette méthode

// ✅ Méthode pour convertir le rôle en type d'agent
private getUserTypeFromRole(role: string): 'etudiant' | 'professionnel' | 'curieux' | 'expert' {
  switch(role) {
    case 'admin': return 'professionnel';
    case 'user': return 'etudiant';
    default: return 'curieux';
  }
}

// events-list.component.ts - Corrigez cette méthode

onEventClick(event: any, eventId: number): void {
  console.log('🖱️ Clic sur événement:', eventId);
  
  const currentUser = this.authService.getCurrentUser();
  const savedUserType = localStorage.getItem('user_type') as UserType | null;
  
  // Déterminer le type d'utilisateur
  let userType: UserType = 'etudiant';
  
  if (savedUserType) {
    userType = savedUserType;
    console.log('📌 Type utilisateur (localStorage):', userType);
  } else if (currentUser?.userType) {
    userType = currentUser.userType;
    console.log('📌 Type utilisateur (currentUser):', userType);
  } else if (currentUser?.role === 'admin') {
    userType = 'professionnel';
    console.log('📌 Type utilisateur (admin):', userType);
  } else {
    console.log('📌 Type utilisateur (défaut): étudiant');
  }
  
  const agent = {
    type: userType,
    budget: this.getBudgetForUserType(userType),
    comportement: this.getComportementForUserType(userType)
  };
  
  console.log('🤖 Agent créé:', agent);
  
  // Trouver l'événement complet
  const fullEvent = this.events.find(e => e.id === eventId);
  
  if (fullEvent) {
    console.log('📅 Événement trouvé:', fullEvent.titre);
    
    // ✅ Vérifier que l'événement a toutes les propriétés nécessaires
    const compatibleEvent = {
      id: fullEvent.id,
      titre: fullEvent.titre,
      type: fullEvent.type,
      prix: fullEvent.prix,
      placesDisponibles: fullEvent.placesDisponibles || 0,
      capaciteMax: fullEvent.capaciteMax || 100,
      description: fullEvent.description || '',
      imageUrl: fullEvent.imageUrl || '',
      dateDebut: fullEvent.dateDebut,
      dateFin: fullEvent.dateFin,
      lieu: fullEvent.lieu,
      populariteReelle: fullEvent.populariteReelle || 0
    };
    
    // ✅ Enregistrer l'interaction
    this.dataCollector.recordInteraction(agent, compatibleEvent, false, 'click')
      .then(() => {
        console.log('✅ Interaction enregistrée avec succès');
      })
      .catch((err) => {
        console.error('❌ Erreur lors de l\'enregistrement:', err);
      });
  } else {
    console.error('❌ Événement non trouvé avec ID:', eventId);
  }
}

  private getBudgetForUserType(userType: UserType): number {
    switch(userType) {
      case 'etudiant': return 50 + Math.random() * 50;
      case 'professionnel': return 300 + Math.random() * 200;
      case 'curieux': return 100 + Math.random() * 150;
      case 'expert': return 500 + Math.random() * 300;
      default: return 200;
    }
  }

private getComportementForUserType(userType: UserType) {
    switch(userType) {
      case 'etudiant':
        return { priceSensitivity: 0.85, spontaneity: 0.4, loyalty: 0.5 };
      case 'professionnel':
        return { priceSensitivity: 0.3, spontaneity: 0.6, loyalty: 0.7 };
      case 'curieux':
        return { priceSensitivity: 0.5, spontaneity: 0.8, loyalty: 0.3 };
      case 'expert':
        return { priceSensitivity: 0.15, spontaneity: 0.3, loyalty: 0.9 };
      default:
        return { priceSensitivity: 0.5, spontaneity: 0.5, loyalty: 0.5 };
    }
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
isFavorite(eventId: number): boolean {
  return this.favoritesMap.get(eventId) || false;
}

getFavoriteId(eventId: number): number | null {
  return this.favoritesService.getFavoriteId(eventId);
}

toggleFavorite(event: any) {
  if (this.isFavorite(event.id)) {
    const favoriteId = this.getFavoriteId(event.id);
    if (favoriteId) {
      this.favoritesService.removeFavorite(favoriteId).subscribe({
        next: () => console.log('Favori retiré'),
        error: (err) => console.error('Erreur:', err)
      });
    }
  } else {
    this.favoritesService.addFavorite(event.id).subscribe({
      next: () => console.log('Favori ajouté'),
      error: (err) => console.error('Erreur:', err)
    });
  }
}

}