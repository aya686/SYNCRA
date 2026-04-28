import { SimulationDashboardComponent } from './modules/frontoffice/components/simulation-dashboard/simulation-dashboard.component';

import { LoginComponent } from './modules/auth/pages/login/login.component';
import { AuthGuard, AdminGuard } from './modules/shared/guards/auth.guard';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportDataComponent } from './modules/reporting/components/export-data/export-data.component';

// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { InscriptionFormationComponent } from './modules/frontoffice/components/inscription-formation/inscription-formation.component';
import { InscriptionFormComponent } from './modules/frontoffice/components/inscription/inscription-form.component';
import { EventFormComponent } from './modules/events/components/event-form/event-form.component';
import { EventListComponent } from './modules/events/components/event-list/event-list.component';
import { FormateurListComponent } from './modules/formateurs/formateur-list/formateur-list.component';
import { FormateurFormComponent } from './modules/formateurs/formateur-form/formateur-form.component';
import { EventDetailComponent } from './modules/events/components/event-detail/event-detail.component';
import { HomeComponent } from './modules/frontoffice/components/home/home.component';
import { EventsListComponent } from './modules/frontoffice/components/events/events-list.component';
import { FormationsListComponent } from './modules/frontoffice/components/formations/formations-list.component';
import { EventDetailComponent as FrontEventDetailComponent } from './modules/frontoffice/components/event-detail/event-detail.component';
import { FormationDetailComponent } from './modules/frontoffice/components/formation-detail/formation-detail.component';
import { FavoritesListComponent } from './modules/frontoffice/components/favorites-list/favorites-list.component';

// Composants de reporting
import { AnalyticsDashboardComponent } from './modules/reporting/components/analytics-dashboard/analytics-dashboard.component';
import { HeatmapComponent } from './modules/reporting/components/heatmap/heatmap.component';

import { EventGeneratorComponent } from './modules/admin/components/event-generator.component';

const routes: Routes = [
  // 1. Login (public)
  { path: 'login', component: LoginComponent },

  // 2. FRONT OFFICE (protégé par AuthGuard)
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'events', component: EventsListComponent },
      { path: 'formations', component: FormationsListComponent },
      { path: 'favoris', component: FavoritesListComponent },
      { path: 'inscription/event/:id', component: InscriptionFormComponent },
      { path: 'inscription/formation/:formationId', component: InscriptionFormationComponent },
            { path: '',loadChildren: () => import('./modules/frontoffice/frontoffice.module').then(m => m.FrontOfficeModule)}

    ]
  },

  // 3. BACK OFFICE (admin)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'events', pathMatch: 'full' },
      { path: 'events', component: EventListComponent },
      { path: 'events/new', component: EventFormComponent },
      { path: 'events/:id/edit', component: EventFormComponent },
      { path: 'events/:id', component: EventDetailComponent },
      { path: 'simulation', component: SimulationDashboardComponent },
      { 
        path: 'formations', 
        loadChildren: () => import('./modules/formations/formations.module').then(m => m.FormationsModule) 
      },
      { path: 'formateurs', component: FormateurListComponent },
      { path: 'formateurs/new', component: FormateurFormComponent },
      { path: 'formateurs/:id/edit', component: FormateurFormComponent },
      { 
        path: 'reporting/participation', 
        loadChildren: () => import('./modules/reporting/reporting.module').then(m => m.ReportingModule) 
      },
      { 
        path: 'reporting/progression', 
        loadChildren: () => import('./modules/reporting/reporting.module').then(m => m.ReportingModule) 
      },
      { 
        path: 'reporting/evaluation', 
        loadChildren: () => import('./modules/reporting/reporting.module').then(m => m.ReportingModule) 
      },
      { path: 'reporting/analytics', component: AnalyticsDashboardComponent },
      { path: 'reporting/heatmap', component: HeatmapComponent },
      { path: 'reporting/export', component: ExportDataComponent },
      { path: 'event-generator', component: EventGeneratorComponent }
    ]
  },

  // 4. Redirection 404
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }