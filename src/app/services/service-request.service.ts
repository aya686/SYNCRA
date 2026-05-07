// src/app/modules/requests/services/service-request.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceRequest, CreateServiceRequest, RequestStatus, RequestType } from '../models/service-request.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private apiUrl = 'http://localhost:8083/api/requests';

  constructor(private http: HttpClient) {}

  // CRUD
  getAllRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(this.apiUrl);
  }

  getRequestById(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.apiUrl}/${id}`);
  }

  createRequest(request: CreateServiceRequest): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.apiUrl, request);
  }

  updateRequest(id: number, request: CreateServiceRequest): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.apiUrl}/${id}`, request);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Requêtes spécifiques
  getRequestsByRequester(requesterId: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/requester/${requesterId}`);
  }

  getRequestsByProvider(providerId: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/provider/${providerId}`);
  }

  getRequestsByStatus(status: RequestStatus): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/status/${status}`);
  }

  getRequestsByType(type: RequestType): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(`${this.apiUrl}/type/${type}`);
  }

  // Actions
  updateStatus(id: number, status: RequestStatus): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.apiUrl}/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  respondToRequest(id: number, response: { message: string; proposedPrice: number; estimatedDelivery: string }): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(`${this.apiUrl}/${id}/respond`, response);
  }

  cancelRequest(id: number): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(`${this.apiUrl}/${id}/cancel`, null);
  }
}