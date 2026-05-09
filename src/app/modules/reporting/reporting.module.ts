import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ParticipationReportComponent } from './components/participation-report/participation-report.component';
import { ProgressionReportComponent } from './components/progression-report/progression-report.component';
import { EvaluationReportComponent } from './components/evaluation-report/evaluation-report.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { ExportDataComponent } from './components/export-data/export-data.component';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { SharedModule } from '../shared/shared.module';  // ← ajoute ça
const routes: Routes = [
  { path: 'participation', component: ParticipationReportComponent },
  { path: 'progression', component: ProgressionReportComponent },
  { path: 'evaluation', component: EvaluationReportComponent }
];

@NgModule({
  declarations: [
    ParticipationReportComponent,
    ProgressionReportComponent,
    EvaluationReportComponent,
    AnalyticsDashboardComponent,
    ExportDataComponent,
    HeatmapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    DecimalPipe,
    DatePipe,
        SharedModule   // ← ajoute ça

  ],
  exports: [
    ParticipationReportComponent,
    ProgressionReportComponent,
    EvaluationReportComponent,
    AnalyticsDashboardComponent,
    ExportDataComponent,
    HeatmapComponent
  ]
})
export class ReportingModule { }