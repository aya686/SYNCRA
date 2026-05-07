import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MesContratsComponent } from './mes-contrats/mes-contrats.component';
import { DetailContratComponent } from './detail-contrat/detail-contrat.component';
import { LitigesAdminDashboardComponent } from './litiges-admin-dashboard/litiges-admin-dashboard.component';
import { CreerContratComponent } from './creer-contrat/creer-contrat.component';
import { ContratsFreelancerComponent } from './contrats-freelancer/contrats-freelancer.component';
import { ContratsAdminDashboardComponent } from './contrats-admin-dashboard/contrats-admin-dashboard.component';
import { PaiementContratComponent } from './paiement-contrat/paiement-contrat.component';

const routes: Routes = [
  {
    path: 'mes-contrats',
    component: MesContratsComponent
  },
  {
    path: 'contrats-freelancer',
    component: ContratsFreelancerComponent
  },
  {
    path: 'admin-contrats',
    component: ContratsAdminDashboardComponent
  },
  {
    path: 'creer-contrat',
    component: CreerContratComponent
  },
  {
    path: 'paiement/:id',
    component: PaiementContratComponent
  },
  {
    path: ':id',
    component: DetailContratComponent
  },
  {
    path: 'admin-litiges',
    component: LitigesAdminDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratsModule {}
