import { Component, OnInit } from '@angular/core';
import { StockService, StockResume, Stock, AlerteStock } from '../../core/services/stock.service';

@Component({
  selector: 'app-dashboard-alerts',
  templateUrl: './dashboard-alerts.component.html',
  styleUrls: ['./dashboard-alerts.component.css'],
  standalone: false
})
export class DashboardAlertsComponent implements OnInit {
  resume: StockResume | null = null;
  stocksEnAlerte: Stock[] = [];
  stocksEpuises: Stock[] = [];
  alertesRecentes: AlerteStock[] = [];
  loading = false;
  emailTestResult: string | null = null;
  emailTestLoading = false;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    
    // Charger le résumé
    this.stockService.getStockResume().subscribe({
      next: (data) => {
        this.resume = data;
      },
      error: (err) => console.error('Erreur résumé:', err)
    });

    // Charger les stocks en alerte
    this.stockService.getStocksEnAlerte().subscribe({
      next: (data) => {
        this.stocksEnAlerte = data;
      },
      error: (err) => console.error('Erreur stocks alerte:', err)
    });

    // Charger les stocks épuisés
    this.stockService.getStocksEpuises().subscribe({
      next: (data) => {
        this.stocksEpuises = data;
      },
      error: (err) => console.error('Erreur stocks épuisés:', err)
    });

    // Charger les alertes récentes
    this.stockService.getAlertesRecentes().subscribe({
      next: (data) => {
        this.alertesRecentes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur alertes récentes:', err);
        this.loading = false;
      }
    });
  }

  testerEmail(): void {
    this.emailTestLoading = true;
    this.emailTestResult = null;
    
    this.stockService.testEmail().subscribe({
      next: (result) => {
        this.emailTestResult = result;
        this.emailTestLoading = false;
      },
      error: (err) => {
        this.emailTestResult = 'Erreur: ' + (err.error?.message || err.message);
        this.emailTestLoading = false;
      }
    });
  }

  rafraichir(): void {
    this.loadAllData();
  }

  reapprovisionner(produitId: number, quantite: number): void {
    this.stockService.reapprovisionner(produitId, quantite).subscribe({
      next: () => {
        alert('Stock réapprovisionné avec succès!');
        this.loadAllData();
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  modifierSeuil(produitId: number, nouveauSeuil: number): void {
    this.stockService.updateSeuilAlerte(produitId, nouveauSeuil).subscribe({
      next: () => {
        alert('Seuil modifié avec succès!');
        this.loadAllData();
      },
      error: (err) => alert('Erreur: ' + err.message)
    });
  }

  getAlerteClass(type: string): string {
    switch(type) {
      case 'STOCK_EPUIS': return 'badge-danger';
      case 'STOCK_BAS': return 'badge-warning';
      case 'RESTOCK': return 'badge-success';
      default: return 'badge-info';
    }
  }
}
