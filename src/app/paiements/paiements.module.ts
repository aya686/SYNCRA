import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./liste-paiements/liste-paiements.component').then(c => c.ListePaiementsComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./detail-paiement/detail-paiement.component').then(c => c.DetailPaiementComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./dashboard-admin-paiements/dashboard-admin-paiements.component').then(c => c.DashboardAdminPaiementsComponent)
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(routes)
  ]
})
export class PaiementsModule {}
