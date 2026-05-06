import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DossierSanteComponent } from './demo/pages/dossier-sante/dossier-sante.component';

const routes: Routes = [
  // ── Landing page ──────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent)
  },

  // ── Pages FRONT OFFICE (sans menu Berry) ──────────────────
  {
    path: 'dossier-sante',
    component: DossierSanteComponent
  },
  {
    path: 'dashboard',                          // ← AJOUTE CETTE ROUTE
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then((c) => c.DashboardBienetreComponent)
  },
  {
    path: 'alertes',                          // ← AJOUTE CETTE ROUTE
    loadComponent: () =>
      import('./demo/pages/alertes-burnout/alertes-burnout.component')
        .then((c) => c.AlertesBurnoutComponent)
  },
   {
    path: 'seances',                          // ← AJOUTE CETTE ROUTE
    loadComponent: () =>
      import('./demo/pages/seances/seances.component')
        .then((c) => c.SeancesComponent)
  },
{ path: 'mon-programme', loadComponent: () => import('./demo/pages/programme/programme.component').then(c => c.ProgrammeComponent) },
{ path: 'bibliotheque', loadComponent: () => import('./demo/pages/bibliotheque/bibliotheque.component').then(c => c.BibliothequeComponent) },
{ path: 'seuils', loadComponent: () => import('./demo/pages/seuils/seuils.component').then(c => c.SeuilsComponent) },
  // ── Back-office Admin (avec menu Berry) ───────────────────
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/default',
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'dashboardadmin',
        loadComponent: () => import('./demo/pages/dashboard/wellness-dashboard.component').then(m => m.WellnessDashboardComponent)
      },
      {
        path: 'specialistesadmin',
        loadComponent: () => import('./demo/pages/dashboard/specialistes.component').then(m => m.SpecialistesComponent)
      },
      // Remplace les imports stubs par :
{
  path: 'seancesadmin',
  loadComponent: () => import('./demo/pages/dashboard/seances-admin.component').then(m => m.SeancesAdminComponent)
},
{
  path: 'alertesadmin',
  loadComponent: () => import('./demo/pages/dashboard/alertes-admin.component').then(m => m.AlertesAdminComponent)
},
{
  path: 'programmesadmin',
  loadComponent: () => import('./demo/pages/dashboard/programmes-admin.component').then(m => m.ProgrammesAdminComponent)
},
{
  path: 'ressourcesadmin',
  loadComponent: () => import('./demo/pages/dashboard/ressources-admin.component').then(m => m.RessourcesAdminComponent)
},
      {
        path: 'typography',
        loadComponent: () => import('./demo/elements/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/elements/element-color/element-color.component').then((c) => c.ElementColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      }
    ]
  },

  // ── Auth pages ────────────────────────────────────────────
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/register/register.component').then((c) => c.RegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }