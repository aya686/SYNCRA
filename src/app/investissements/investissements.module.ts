import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'investisseurs-partenaires',
    loadComponent: () => import('./investisseurs-partenaires/investisseurs-partenaires.component').then((c) => c.InvestisseursPartenairesComponent)
  },
  {
    path: 'soumettre-mise-fonds/:id',
    loadComponent: () => import('./soumettre-mise-fonds/soumettre-mise-fonds.component').then((c) => c.SoumettreMiseFondsComponent)
  },
  {
    path: 'dashboard-investisseur',
    loadComponent: () => import('./dashboard-investisseur/dashboard-investisseur.component').then((c) => c.DashboardInvestisseurComponent)
  },
  {
    path: 'negociation/:id',
    loadComponent: () => import('./negociation/negociation.component').then((c) => c.NegociationComponent)
  },
  {
    path: 'formulaire-negociation/:projet',
    loadComponent: () => import('./formulaire-negociation/formulaire-negociation.component').then((c) => c.FormulaireNegociationComponent)
  },
  {
    path: 'conventions-actives',
    loadComponent: () => import('./conventions-actives/conventions-actives.component').then((c) => c.ConventionsActivesComponent)
  },
  {
    path: 'dashboard-admin-investissements',
    loadComponent: () => import('./dashboard-admin-investissements/dashboard-admin-investissements.component').then((c) => c.DashboardAdminInvestissementsComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvestissementsModule {}
