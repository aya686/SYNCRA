import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ParticipationReportComponent } from './components/participation-report/participation-report.component';
import { ProgressionReportComponent } from './components/progression-report/progression-report.component';
import { EvaluationReportComponent } from './components/evaluation-report/evaluation-report.component';

const routes: Routes = [
  { path: 'participation', component: ParticipationReportComponent },
  { path: 'progression', component: ProgressionReportComponent },
  { path: 'evaluation', component: EvaluationReportComponent }
];

@NgModule({
  declarations: [
    ParticipationReportComponent,
    ProgressionReportComponent,
    EvaluationReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ParticipationReportComponent,
    ProgressionReportComponent,
    EvaluationReportComponent
  ]
})
export class ReportingModule { }