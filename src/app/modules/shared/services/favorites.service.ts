// src/app/modules/shared/services/favorites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { SimpleAuthService, SimpleUser } from '../../auth/services/simple-auth.service';

export interface Favorite {
  id: number;
  userId: number;
  evenementId: number;
  dateAjout: Date;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private apiUrl = 'http://localhost:8089/event_db/api/favoris';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  
  private currentUser: SimpleUser | null = null;

  constructor(
    private http: HttpClient,
    private authService: SimpleAuthService
  ) {
    // Écouter les changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadFavorites();
      } else {
        this.favoritesSubject.next([]);
      }
    });
  }

  private loadFavorites() {
    if (!this.currentUser) return;
    
    this.http.get<Favorite[]>(`${this.apiUrl}/user/${this.currentUser.id}`)
      .subscribe({
        next: (favorites) => {
          this.favoritesSubject.next(favorites);
        },
        error: (err) => console.error('Erreur chargement favoris:', err)
      });
  }

  addFavorite(evenementId: number): Observable<Favorite> {
    if (!this.currentUser) throw new Error('Utilisateur non connecté');
    
    const body = {
      userId: this.currentUser.id,
      evenementId: evenementId
    };
    
    return this.http.post<Favorite>(this.apiUrl, body).pipe(
      tap(newFavorite => {
        const current = this.favoritesSubject.value;
        this.favoritesSubject.next([...current, newFavorite]);
      })
    );
  }

  removeFavorite(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`).pipe(
      tap(() => {
        const current = this.favoritesSubject.value;
        this.favoritesSubject.next(current.filter(f => f.id !== favoriteId));
      })
    );
  }

  isFavorite(evenementId: number): boolean {
    return this.favoritesSubject.value.some(f => f.evenementId === evenementId);
  }

  // Dans favorites.service.ts
getFavoriteEventIds(): number[] {
  return this.favoritesSubject.value.map(f => f.evenementId);
}

getFavoriteId(eventId: number): number | null {
  const favorite = this.favoritesSubject.value.find(f => f.evenementId === eventId);
  return favorite ? favorite.id : null;
}
}