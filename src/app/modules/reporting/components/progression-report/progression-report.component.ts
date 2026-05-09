import { Component, OnInit } from '@angular/core';
import { ReportingService } from '../../services/reporting.service';

@Component({
    selector: 'app-progression-report',
    templateUrl: './progression-report.component.html',
    styleUrls: ['./progression-report.component.css'],
    standalone: false
})
export class ProgressionReportComponent implements OnInit {
  stats: any = {};

  constructor(private reportingService: ReportingService) {}

  ngOnInit(): void {
    this.loadStats();
  }
getRepartitionNiveauxEntries(): {key: string, value: number}[] {
  if (!this.stats.repartitionNiveaux) return [];
  return Object.entries(this.stats.repartitionNiveaux).map(([key, value]) => ({
    key: key,
    value: value as number
  }));
}
  loadStats(): void {
    this.reportingService.getProgressionStats().subscribe(stats => {
      this.stats = stats;
    });
  }
}