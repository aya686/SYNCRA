// src/app/services/review.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  userAvatarUrl: string;
  machineId: number | null;
  serviceId: number | null;
  machineName?: string;
  serviceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
  userId: number;
  userName: string;
  machineId?: number | null;
  serviceId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8083/api/reviews';

  constructor(private http: HttpClient) {}

  // Récupérer tous les avis
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  // Récupérer un avis par ID
  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  // Créer un avis pour une machine
  createMachineReview(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/machine`, review);
  }

  // Créer un avis pour un service
  createServiceReview(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/service`, review);
  }

  // Modifier un avis
  updateReview(id: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  // Supprimer un avis
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les avis d'une machine
  getReviewsByMachine(machineId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/machine/${machineId}`);
  }

  // Récupérer les avis d'un service
  getReviewsByService(serviceId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/service/${serviceId}`);
  }

  // Récupérer les avis d'un utilisateur
  getReviewsByUser(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Récupérer la note moyenne d'une machine
  getAverageRatingForMachine(machineId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/machine/${machineId}/rating`);
  }

  // Récupérer la note moyenne d'un service
  getAverageRatingForService(serviceId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/service/${serviceId}/rating`);
  }
}