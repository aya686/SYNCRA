import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: 'mes-candidatures',
        loadComponent: () => import('./mes-candidatures/mes-candidatures.component').then(m => m.MesCandidaturesComponent)
      },
      {
        path: 'postuler/:offreId',
        loadComponent: () => import('./postuler/postuler.component').then(m => m.PostulerComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./detail-candidature/detail-candidature.component').then(m => m.DetailCandidatureComponent)
      },
      {
        path: 'admin-dashboard',
        loadComponent: () => import('./candidatures-admin-dashboard/candidatures-admin-dashboard.component').then(m => m.CandidaturesAdminDashboardComponent)
      }
    ])
  ]
})
export class CandidaturesModule { }
