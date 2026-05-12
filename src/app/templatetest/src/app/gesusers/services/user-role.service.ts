// user-role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../models/user-role.model';

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private readonly baseUrl = 'http://localhost:8082';
  private apiUrl = `${this.baseUrl}/api/user-roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.apiUrl);
  }

  getById(id: number): Observable<UserRole> {
    return this.http.get<UserRole>(`${this.apiUrl}/${id}`);
  }

  getByUser(userId: number): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/user/${userId}`);
  }

  getActiveByUser(userId: number): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/user/${userId}/actifs`);
  }

  assignRole(userId: number, roleId: number, dateExpiration?: string, motif?: string): Observable<UserRole> {
    let url = `${this.apiUrl}/assigner/${userId}?idRole=${roleId}`;
    if (motif) url += `&motif=${motif}`;
    if (dateExpiration) url += `&dateExpiration=${dateExpiration}`;
    return this.http.post<UserRole>(url, {});
  }

  revokeRole(userRoleId: number, motif?: string): Observable<UserRole> {
    let url = `${this.apiUrl}/${userRoleId}/revoquer`;
    if (motif) url += `?motif=${motif}`;
    return this.http.put<UserRole>(url, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}