import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  // ── LANDING ──
  {
    path: '',
    loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent)
  },

  // ── BACK OFFICE (sidebar Berry) ──
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
      },

      // MS2 BACK OFFICE — route différente du front office, pas de conflit
      {
        path: 'ms2/admin/projets',
        loadComponent: () =>
          import('./ms2/projets/dashboard-projets/dashboard-projets.component')
            .then((c) => c.DashboardProjetsComponent)
      }
    ]
  },

  // ── FRONT OFFICE (style landing page) ──
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
      },

      // MS2 FRONT OFFICE
      {
        path: 'ms2/projets',
        loadComponent: () =>
          import('./ms2/projets/dashboard-projets/dashboard-projets.component')
            .then((c) => c.DashboardProjetsComponent)
      },
      {
        path: 'ms2/projets/nouveau',   // ← AVANT /:id pour ne pas être intercepté
        loadComponent: () =>
          import('./ms2/projets/create-projet/create-projet.component')
            .then((c) => c.CreateProjetComponent)
      },
      {
        path: 'ms2/projets/:id/modifier',   // ← AVANT /:id
        loadComponent: () =>
          import('./ms2/projets/create-projet/create-projet.component')
            .then((c) => c.CreateProjetComponent)
      },
      {
        path: 'ms2/projets/:id',   // ← EN DERNIER
        loadComponent: () =>
          import('./ms2/projets/detail-projet/detail-projet.component')
            .then((c) => c.DetailProjetComponent)
      },
      {
  path: 'ms2/taches/:projetId/kanban',
  loadComponent: () =>
    import('./ms2/taches/kanban/kanban.component')
      .then((c) => c.KanbanComponent)
},
{
  path: 'ms2/taches/:id',
  loadComponent: () =>
    import('./ms2/taches/detail-tache/detail-tache.component')
      .then((c) => c.DetailTacheComponent)
},
{
  path: 'ms2/sessions',
  loadComponent: () =>
    import('./ms2/sessions/session-travail/session-travail.component')
      .then((c) => c.SessionTravailComponent)
},
    {
        path: 'ms2/idees',
        loadComponent: () =>
          import('./ms2/mes-idees/mes-idees.component')
          .then((c) => c.MesIdeesComponent)
      },
      {
  path: 'ms2/alertes',
  loadComponent: () =>
    import('./ms2/mes-alertes/mes-alertes.component')
      .then((c) => c.MesAlertesComponent)
},
      //{
        //path: 'ms2/alertes',
       // loadComponent: () =>
         // import('./ms2/alertes/mes-alertes/mes-alertes.component')
           // .then((c) => c.MesAlertesComponent)
      //},
      //{
       // path: 'ms2/sessions',
        //loadComponent: () =>
          //import('./ms2/sessions/session-travail/session-travail.component')
            //.then((c) => c.SessionTravailComponent)
      //}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}