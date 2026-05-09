import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

const API_BASE = 'http://localhost:8082/api/admin';

interface Stats {
  connexionsToday: number;
  twoFACount: number;
  blockedCount: number;
  avgMlScore: number;
  suspendedCount: number;
}

interface SuspendedUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  reason: string;
  date: string;
  riskScore: number;
  isolationScore: number;
  randomForestScore: number;
  ruleTriggered: string;
  mlDecision: string;
}

interface RecentLogin {
  id: number;
  userEmail: string;
  userName: string;
  loginTime: string;
  country: string;
  deviceType: string;
  isolationScore: number;
  randomForestScore: number;
  riskScore: number;
  decision: string;
  ruleTriggered: string;
  isSuccessful: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  stats: Stats = {
    connexionsToday: 0,
    twoFACount: 0,
    blockedCount: 0,
    avgMlScore: 0,
    suspendedCount: 0
  };

  suspendedUsers: SuspendedUser[] = [];
  recentLogins: RecentLogin[] = [];
  distribution = { normal: 0, twoFA: 0, blocked: 0 };
  loading = true;

  private eventSource: EventSource | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.connectToSSE();
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  connectToSSE(): void {
    this.eventSource = new EventSource('http://localhost:8082/api/admin/stream', { withCredentials: true });
    
    this.eventSource.addEventListener('blocked', (event) => {
      console.log('🔴 NOUVEAU BLOCAGE:', JSON.parse(event.data));
      this.loadDashboard();
    });
    
    this.eventSource.addEventListener('reactivated', (event) => {
      console.log('🟢 COMPTE RÉACTIVÉ:', JSON.parse(event.data));
      this.loadDashboard();
    });
    
    this.eventSource.onerror = (error) => {
      console.error('❌ Erreur SSE:', error);
    };
  }

  loadDashboard(): void {
    this.loading = true;
    console.log('🔄 Chargement dashboard...');

    let completedRequests = 0;
    const totalRequests = 4;

    const checkAllCompleted = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
        this.cdr.detectChanges();
        console.log('✅ Toutes les requêtes terminées');
      }
    };

    this.http.get<Stats>(`${API_BASE}/stats`, { withCredentials: true })
      .subscribe({
        next: (d) => { 
          this.stats = d; 
          console.log('Stats:', d);
          this.cdr.detectChanges();
        },
        error: (e) => console.error('Erreur stats:', e),
        complete: () => checkAllCompleted()
      });

    this.http.get<SuspendedUser[]>(`${API_BASE}/suspended-users`, { withCredentials: true })
      .subscribe({
        next: (d) => { 
          this.suspendedUsers = d; 
          console.log('Suspendus:', d.length);
          this.cdr.detectChanges();
        },
        error: (e) => console.error('Erreur suspended:', e),
        complete: () => checkAllCompleted()
      });

    this.http.get<RecentLogin[]>(`${API_BASE}/recent-logins?limit=20`, { withCredentials: true })
      .subscribe({
        next: (d) => { 
          this.recentLogins = d; 
          console.log('Logins:', d.length);
          this.cdr.detectChanges();
        },
        error: (e) => console.error('Erreur logins:', e),
        complete: () => checkAllCompleted()
      });

    this.http.get<{ normal: number, twoFA: number, blocked: number }>(`${API_BASE}/decision-distribution`, { withCredentials: true })
      .subscribe({
        next: (d) => { 
          this.distribution = d; 
          console.log('Distribution:', d);
          this.cdr.detectChanges();
        },
        error: (e) => { console.error('Erreur distribution:', e); },
        complete: () => checkAllCompleted()
      });
  }

  reactivateUser(userId: number): void {
    if (!confirm('Réactiver ce compte ?')) return;
    this.http.put(`${API_BASE}/users/${userId}/reactivate`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loadDashboard();
        },
        error: () => alert('Erreur lors de la réactivation')
      });
  }

  getScoreColor(score: number): string {
    if (!score) return '#94a3b8';
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f59e0b';
    return '#22c55e';
  }

  getDecisionClass(decision: string): string {
    switch (decision) {
      case 'NORMAL': return 'badge-success';
      case '2FA_REQUIRED': return 'badge-warning';
      case 'BLOCKED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}