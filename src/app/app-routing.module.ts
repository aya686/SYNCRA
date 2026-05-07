import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./roles/roles-selection/roles-selection.component').then((c) => c.RolesSelectionComponent)
      },
      {
        path: 'freelancer',
        loadComponent: () => import('./roles/freelancer-home/freelancer-home.component').then((c) => c.FreelancerHomeComponent)
      },
      {
        path: 'client',
        loadComponent: () => import('./roles/client-home/client-home.component').then((c) => c.ClientHomeComponent)
      },
      {
        path: 'partenaire',
        loadComponent: () => import('./roles/partenaire-home/partenaire-home.component').then((c) => c.PartenaireHomeComponent)
      },
      {
        path: 'investisseur',
        loadComponent: () => import('./roles/investisseur-home/investisseur-home.component').then((c) => c.InvestisseurHomeComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./roles/admin-home/admin-home.component').then((c) => c.AdminHomeComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/register/register.component').then((c) => c.RegisterComponent)
      },
      {
        path: 'landing',
        loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent)
      },
      {
        path: 'chat',
        loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule)
      }
    ]
  },
  {
    path: '',
    component: AdminComponent,
    children: [
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
      {
        path: 'offres',
        loadChildren: () => import('./offres/offres.module').then((m) => m.OffresModule)
      },
      {
        path: 'candidatures',
        loadChildren: () => import('./candidatures/candidatures.module').then((m) => m.CandidaturesModule)
      },
      {
        path: 'contrats',
        loadChildren: () => import('./contrats/contrats.module').then((m) => m.ContratsModule)
      },
      {
        path: 'investissements',
        loadChildren: () => import('./investissements/investissements.module').then((m) => m.InvestissementsModule)
      },
      {
        path: 'partenariats',
        loadChildren: () => import('./partenariats/partenariats.module').then((m) => m.PartenariatsModule)
      },
      {
        path: 'paiements',
        loadChildren: () => import('./paiements/paiements.module').then((m) => m.PaiementsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
