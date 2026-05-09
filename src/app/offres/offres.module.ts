import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MarketplaceComponent } from './marketplace/marketplace.component';
import { CreerOffreComponent } from './creer-offre/creer-offre.component';
import { ModifierOffreComponent } from './modifier-offre/modifier-offre.component';
import { DetailOffreComponent } from './detail-offre/detail-offre.component';
import { MesOffresComponent } from './mes-offres/mes-offres.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'creer', component: CreerOffreComponent },
  { path: 'modifier/:id', component: ModifierOffreComponent },
  { path: 'detail/:id', component: DetailOffreComponent },
  { path: 'mes-offres', component: MesOffresComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Standalone components s'importent ici
    MarketplaceComponent,
    CreerOffreComponent,
    ModifierOffreComponent,
    DetailOffreComponent,
    MesOffresComponent,
    AdminDashboardComponent
  ]
  // PAS de declarations car tous sont standalone
})
export class OffresModule { }