import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ExportService } from '../../../shared/services/export.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {
  exportType: string = 'excel';
  dataType: string = 'events';
  dateRange: string = 'all';
  loading = false;
  
  // Statistiques - correction des noms
  stats = {
    events: 0,           // ← au lieu de totalEvents
    formations: 0,       // ← au lieu de totalFormations
    participants: 0,     // ← au lieu de totalParticipants
    inscriptions: 0      // ← au lieu de totalInscriptions
  };

  constructor(
    private http: HttpClient,
    private exportService: ExportService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.http.get('http://localhost:8089/event_db/api/stats/global').subscribe({
      next: (data: any) => {
        this.stats = {
          events: data.totalEvents || 0,
          formations: data.totalFormations || 0,
          participants: data.totalParticipants || 0,
          inscriptions: data.totalInscriptions || 0
        };
        console.log('Stats chargées:', this.stats);
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  exportData(): void {
    this.loading = true;
    
    let url = '';
    let fileName = '';
    
    switch (this.dataType) {
      case 'events':
        url = 'http://localhost:8089/event_db/api/events';
        fileName = `evenements_${new Date().toISOString().slice(0, 19)}`;
        break;
      case 'formations':
        url = 'http://localhost:8089/event_db/api/formations';
        fileName = `formations_${new Date().toISOString().slice(0, 19)}`;
        break;
      case 'participants':
        url = 'http://localhost:8089/event_db/api/participants';
        fileName = `participants_${new Date().toISOString().slice(0, 19)}`;
        break;
      case 'inscriptions':
        url = 'http://localhost:8089/event_db/api/inscriptions';
        fileName = `inscriptions_${new Date().toISOString().slice(0, 19)}`;
        break;
      case 'formateurs':
        url = 'http://localhost:8089/event_db/api/formateurs';
        fileName = `formateurs_${new Date().toISOString().slice(0, 19)}`;
        break;
      default:
        this.loading = false;
        return;
    }
    
    this.http.get(url).subscribe({
      next: (data: any) => {
        const formattedData = this.formatDataForExport(data);
        
        switch (this.exportType) {
          case 'excel':
            this.exportService.exportToExcel(formattedData, fileName, this.getSheetName());
            break;
          case 'csv':
            this.exportService.exportToCSV(formattedData, fileName);
            break;
          case 'json':
            this.exportService.exportToJSON(formattedData, fileName);
            break;
          case 'pdf':
            this.exportService.exportToPDF(formattedData, fileName, this.getTitle());
            break;
        }
        
        this.notificationService.success(`${formattedData.length} enregistrements exportés avec succès`);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notificationService.error('Erreur lors de l\'export');
        this.loading = false;
      }
    });
  }

  formatDataForExport(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      const formatted: any = {};
      
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          let value = item[key];
          
          if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
            value = new Date(value).toLocaleString('fr-FR');
          }
          
          if (typeof value === 'boolean') {
            value = value ? 'Oui' : 'Non';
          }
          
          formatted[key] = value;
        }
      }
      
      return formatted;
    });
  }

  getSheetName(): string {
    const names: { [key: string]: string } = {
      'events': 'Événements',
      'formations': 'Formations',
      'participants': 'Participants',
      'inscriptions': 'Inscriptions',
      'formateurs': 'Formateurs'
    };
    return names[this.dataType] || 'Données';
  }

  getTitle(): string {
    const titles: { [key: string]: string } = {
      'events': 'Liste des Événements',
      'formations': 'Liste des Formations',
      'participants': 'Liste des Participants',
      'inscriptions': 'Liste des Inscriptions',
      'formateurs': 'Liste des Formateurs'
    };
    return titles[this.dataType] || 'Export de données';
  }
}