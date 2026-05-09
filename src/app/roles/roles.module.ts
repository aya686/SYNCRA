import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./roles-selection/roles-selection.component').then(c => c.RolesSelectionComponent)
  },
  {
    path: 'freelancer',
    loadComponent: () => import('./freelancer-home/freelancer-home.component').then(c => c.FreelancerHomeComponent)
  },
  {
    path: 'client',
    loadComponent: () => import('./client-home/client-home.component').then(c => c.ClientHomeComponent)
  },
  {
    path: 'partenaire',
    loadComponent: () => import('./partenaire-home/partenaire-home.component').then(c => c.PartenaireHomeComponent)
  },
  {
    path: 'investisseur',
    loadComponent: () => import('./investisseur-home/investisseur-home.component').then(c => c.InvestisseurHomeComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-home/admin-home.component').then(c => c.AdminHomeComponent)
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RolesModule {}
