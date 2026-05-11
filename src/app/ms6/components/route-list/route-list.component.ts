import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteService, RouteSummary, RouteResponse, RouteLivraison, PointLivraison } from '../../services/route.service';

@Component({
  selector: 'app-route-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css'
})
export class RouteListComponent implements OnInit {
  routes: RouteSummary[] = [];
  selectedRoute: RouteLivraison | null = null;
  loading = false;
  error: string | null = null;

  // Formulaire nouvelle route
  newRoute = {
    routeName: '',
    depot: {
      adresse: 'Entrepôt Principal, Rue de Marseille, Tunis',
      latitude: 36.8065,
      longitude: 10.1815
    },
    points: [
      {
        adresse: '15 Avenue Habib Bourguiba',
        ville: 'Tunis',
        codePostal: '1000',
        latitude: 36.8008,
        longitude: 10.1803,
        nbColis: 2,
        poidsKg: 12.5,
        volumeM3: 0.5,
        priorite: 5
      },
      {
        adresse: '42 Rue de la Liberté',
        ville: 'Tunis',
        codePostal: '1000',
        latitude: 36.7995,
        longitude: 10.1850,
        nbColis: 1,
        poidsKg: 8.0,
        volumeM3: 0.3,
        priorite: 4
      }
    ],
    maxCapacity: 20
  };

  // Transporteur pour assignation
  transporteur = 'DHL Express';

  constructor(private routeService: RouteService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService.getAllRoutes().subscribe({
      next: (response) => {
        this.routes = response.routes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement routes: ' + err.message;
        this.loading = false;
      }
    });
  }

  viewRouteDetails(routeId: number): void {
    this.loading = true;
    this.routeService.getRouteById(routeId).subscribe({
      next: (response) => {
        this.selectedRoute = response.route;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Route non trouvée: ' + err.message;
        this.loading = false;
      }
    });
  }

  createRoute(): void {
    this.loading = true;
    const request = {
      routeName: this.newRoute.routeName || 'Nouvelle Route',
      depot: this.newRoute.depot,
      points: this.newRoute.points,
      constraints: { maxCapacity: this.newRoute.maxCapacity }
    };

    this.routeService.optimizeRoute(request).subscribe({
      next: (response) => {
        this.selectedRoute = response.route;
        this.loadRoutes();
        this.loading = false;
        alert(`Route créée! ID: ${response.route.routeId}\nDistance: ${response.route.distanceTotaleKm.toFixed(2)} km\nOptimisation: ${response.optimizationStats.pourcentageAmelioration.toFixed(2)}%`);
      },
      error: (err) => {
        this.error = 'Erreur création: ' + err.message;
        this.loading = false;
      }
    });
  }

  assignRoute(routeId: number): void {
    this.routeService.updateRouteStatus(routeId, {
      statut: 'ASSIGNEE',
      transporteur: this.transporteur
    }).subscribe({
      next: () => {
        alert('Route assignée à ' + this.transporteur);
        this.viewRouteDetails(routeId);
      },
      error: (err) => {
        this.error = 'Erreur assignation: ' + err.message;
      }
    });
  }

  startRoute(routeId: number): void {
    this.routeService.updateRouteStatus(routeId, {
      statut: 'EN_COURS'
    }).subscribe({
      next: () => {
        alert('Route démarrée!');
        this.viewRouteDetails(routeId);
      },
      error: (err) => {
        this.error = 'Erreur démarrage: ' + err.message;
      }
    });
  }

  completeRoute(routeId: number): void {
    this.routeService.updateRouteStatus(routeId, {
      statut: 'TERMINEE'
    }).subscribe({
      next: () => {
        alert('Route terminée!');
        this.viewRouteDetails(routeId);
      },
      error: (err) => {
        this.error = 'Erreur clôture: ' + err.message;
      }
    });
  }

  reoptimizeRoute(routeId: number): void {
    this.loading = true;
    this.routeService.reoptimizeRoute(routeId).subscribe({
      next: (response) => {
        this.selectedRoute = response.route;
        this.loadRoutes();
        this.loading = false;
        alert(`Route réoptimisée!\nNouvelle distance: ${response.route.distanceTotaleKm.toFixed(2)} km\nAmélioration: ${response.optimizationStats.pourcentageAmelioration.toFixed(2)}%`);
      },
      error: (err) => {
        this.error = 'Erreur réoptimisation: ' + err.message;
        this.loading = false;
      }
    });
  }

  deleteRoute(routeId: number): void {
    if (confirm('Confirmer la suppression?')) {
      this.routeService.deleteRoute(routeId).subscribe({
        next: () => {
          this.selectedRoute = null;
          this.loadRoutes();
          alert('Route supprimée');
        },
        error: (err) => {
          this.error = 'Erreur suppression: ' + err.message;
        }
      });
    }
  }

  updatePointStatus(pointId: number, status: string): void {
    this.routeService.updatePointStatus(pointId, status).subscribe({
      next: (point) => {
        alert(`Point ${point.adresse} - Statut: ${point.statut}`);
        if (this.selectedRoute) {
          this.viewRouteDetails(this.selectedRoute.routeId);
        }
      },
      error: (err) => {
        this.error = 'Erreur mise à jour point: ' + err.message;
      }
    });
  }

  addPoint(): void {
    this.newRoute.points.push({
      adresse: '',
      ville: 'Tunis',
      codePostal: '1000',
      latitude: 0,
      longitude: 0,
      nbColis: 1,
      poidsKg: 0,
      volumeM3: 0,
      priorite: 3
    });
  }

  removePoint(index: number): void {
    this.newRoute.points.splice(index, 1);
  }

  closeDetails(): void {
    this.selectedRoute = null;
  }

  getStatusClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'PLANIFIEE': 'badge-info',
      'ASSIGNEE': 'badge-warning',
      'EN_COURS': 'badge-primary',
      'TERMINEE': 'badge-success',
      'ANNULEE': 'badge-danger'
    };
    return classes[statut] || 'badge-default';
  }
}
