import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RouteRequest {
  routeName: string;
  depot: DepotRequest;
  points: DeliveryPointRequest[];
  constraints?: VehicleConstraints;
}

export interface DepotRequest {
  adresse: string;
  latitude: number;
  longitude: number;
}

export interface DeliveryPointRequest {
  adresse: string;
  ville: string;
  codePostal: string;
  latitude: number;
  longitude: number;
  demand?: number;
  nbColis?: number;
  poidsKg?: number;
  volumeM3?: number;
  priorite?: number;
  tempsServiceMinutes?: number;
  fenetreDebut?: string;
  fenetreFin?: string;
  nomContact?: string;
  telephoneContact?: string;
  instructionsSpeciales?: string;
}

export interface VehicleConstraints {
  maxCapacity: number;
}

export interface RouteResponse {
  route: RouteLivraison;
  optimizationStats: OptimizationStats;
}

export interface RouteLivraison {
  routeId: number;
  nom: string;
  statut: string;
  dateCreation: string;
  dateOptimisation: string;
  distanceTotaleKm: number;
  dureeEstimeeMinutes: number;
  coutEstime: number | null;
  nbPoints: number;
  nbColis: number;
  poidsTotalKg: number;
  volumeTotalM3: number;
  pointDepart: string;
  latitudeDepart: number;
  longitudeDepart: number;
  transporteur: string | null;
  algorithmeUtilise: string;
  iterationOptimisation: number;
  amelioration2OptPercent: number;
  points: PointLivraison[];
  metrics?: RouteMetrics;
}

export interface PointLivraison {
  pointId: number;
  livraisonId: number | null;
  commandeId: number | null;
  adresse: string;
  ville: string;
  codePostal: string;
  latitude: number;
  longitude: number;
  ordre: number;
  distancePrecedentKm: number;
  distanceDepartKm: number;
  distanceCumuleeKm: number;
  tempsEstimeMinutes: number;
  tempsCumuleMinutes: number;
  heureArriveeEstimee: string;
  fenetreDebut: string | null;
  fenetreFin: string | null;
  nbColis: number;
  poidsKg: number;
  volumeM3: number;
  statut: string;
  priorite: number;
  nomContact: string | null;
  telephoneContact: string | null;
  instructionsSpeciales: string | null;
  penaliteFenetreHoraire: number;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  nbPoints: number;
  avgDistanceBetweenPoints: number;
  maxDistanceBetweenPoints: number;
  efficiencyPointsPerKm: number;
  timeWindowRespectPercent: number;
  twoOptImprovementPercent: number;
  densitePoints: number;
  respecteContraintesCapacite: boolean;
}

export interface OptimizationStats {
  algorithmePrincipal: string;
  algorithmeSecondaire: string;
  nbPointsOptimises: number;
  iterationsClarkeWright: number;
  swaps2Opt: number;
  distanceInitialeEstimee: number;
  distanceFinale: number;
  pourcentageAmelioration: number;
  tempsCalculMs: number;
  complexiteAlgorithmique: string;
}

export interface RouteListResponse {
  routes: RouteSummary[];
  totalCount: number;
  activeCount: number;
  completedCount: number;
}

export interface RouteSummary {
  routeId: number;
  nom: string;
  statut: string;
  dateOptimisation: string;
  distanceTotaleKm: number;
  nbPoints: number;
  transporteur: string | null;
}

export interface UpdateRouteStatusRequest {
  statut: 'PLANIFIEE' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  transporteur?: string;
  fenetreDebut?: string;
  fenetreFin?: string;
}

export interface RouteAnalytics {
  averageDistancePerRoute: number;
  averagePointsPerRoute: number;
  averageEfficiency: number;
  totalRoutes: number;
  totalDistanceKm: number;
  totalPointsDelivered: number;
  statsByTransporteur: TransporteurStats[];
  dailyStats: DailyStats[];
}

export interface TransporteurStats {
  transporteur: string;
  nombreRoutes: number;
  distanceTotaleKm: number;
}

export interface DailyStats {
  date: string;
  nombreRoutes: number;
  nombrePoints: number;
  distanceTotaleKm: number;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:8086/ms6/api/routes';

  constructor(private http: HttpClient) {}

  // ==================== ROUTES ====================

  getAllRoutes(statut?: string): Observable<RouteListResponse> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    return this.http.get<RouteListResponse>(this.apiUrl, { params });
  }

  getRouteById(routeId: number): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.apiUrl}/${routeId}`);
  }

  getRouteMetrics(routeId: number): Observable<RouteMetrics> {
    return this.http.get<RouteMetrics>(`${this.apiUrl}/${routeId}/metrics`);
  }

  optimizeRoute(request: RouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(`${this.apiUrl}/optimize`, request);
  }

  updateRouteStatus(routeId: number, request: UpdateRouteStatusRequest): Observable<RouteLivraison> {
    return this.http.put<RouteLivraison>(`${this.apiUrl}/${routeId}/status`, request);
  }

  reoptimizeRoute(routeId: number): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(`${this.apiUrl}/${routeId}/reoptimize`, {});
  }

  deleteRoute(routeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${routeId}`);
  }

  // ==================== RECHERCHE ====================

  getRoutesByTransporteur(transporteur: string): Observable<RouteSummary[]> {
    return this.http.get<RouteSummary[]>(`${this.apiUrl}/by-transporteur/${encodeURIComponent(transporteur)}`);
  }

  // ==================== ANALYTICS ====================

  getAnalytics(dateDebut: string, dateFin: string): Observable<RouteAnalytics> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<RouteAnalytics>(`${this.apiUrl}/analytics`, { params });
  }

  // ==================== POINTS ====================

  updatePointStatus(pointId: number, statut: string): Observable<PointLivraison> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<PointLivraison>(`${this.apiUrl}/points/${pointId}/status`, {}, { params });
  }
}
