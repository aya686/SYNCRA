import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { UserListComponent } from './gesusers/components/user-list/user-list.component';
import { RegisterComponent } from './gesusers/components/register/register.component';
import { RegisterDetailsComponent } from './gesusers/components/register/details/register-details.component';
import { ProfileComponent } from './gesusers/components/profile/profile.component';
import { LoginComponent } from './gesusers/components/login/login.component';
import { AdminDashboardComponent } from './gesusers/components/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  // Page d'accueil (sans layout)
  {
    path: '',
    loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent)
  },

  // Tout ce qui a la sidebar+navbar Berry
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
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'users',
        component: UserListComponent
      },
      // ✅ Route pour le profil (sans "gesusers")
      {
        path: 'profile/:id',
        component: ProfileComponent
      }
    ]
  },

  // Pages sans layout (login, register)
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
      {
        path: 'my-login',
        component: LoginComponent
      },
      {
        path: 'gesusers/register',
        component: RegisterComponent
      },
      {
        path: 'gesusers/register/details',
        component: RegisterDetailsComponent
      }
    ]
  },

  // ✅ Redirection pour l'ancienne route (si quelqu'un l'utilise encore)
  {
    path: 'gesusers/profile/:id',
    redirectTo: 'profile/:id',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }