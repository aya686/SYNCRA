import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportDataComponent } from './modules/reporting/components/export-data/export-data.component';

// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { InscriptionFormationComponent } from './modules/frontoffice/components/inscription-formation/inscription-formation.component';
import { InscriptionFormComponent } from './modules/frontoffice/components/inscription/inscription-form.component';
import { EventFormComponent } from './modules/events/components/event-form/event-form.component';
import { FormateurListComponent } from './modules/formateurs/formateur-list/formateur-list.component';
import { FormateurFormComponent } from './modules/formateurs/formateur-form/formateur-form.component';

// Composants de reporting
import { AnalyticsDashboardComponent } from './modules/reporting/components/analytics-dashboard/analytics-dashboard.component';
import { HeatmapComponent } from './modules/reporting/components/heatmap/heatmap.component';

const routes: Routes = [
  // Front Office (public)
  { path: 'inscription/event/:id', component: InscriptionFormComponent },
  { path: 'inscription/formation/:formationId', component: InscriptionFormationComponent },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { 
        path: '', 
        loadChildren: () => import('./modules/frontoffice/frontoffice.module').then(m => m.FrontOfficeModule) 
      }
    ]
  },

  // Back Office (admin)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      // Événements
      { 
        path: 'events', 
        loadChildren: () => import('./modules/events/events.module').then(m => m.EventsModule) 
      },
      { 
        path: 'events/new', 
        component: EventFormComponent 
      },
      { 
        path: 'events/:id/edit', 
        component: EventFormComponent 
      },
      
      // Formations
      { 
        path: 'formations', 
        loadChildren: () => import('./modules/formations/formations.module').then(m => m.FormationsModule) 
      },
      
      // Formateurs
      { 
        path: 'formateurs', 
        component: FormateurListComponent 
      },
      { 
        path: 'formateurs/new', 
        component: FormateurFormComponent 
      },
      { 
        path: 'formateurs/:id/edit', 
        component: FormateurFormComponent 
      },
      
      // Reporting - Routes directes (pas de lazy loading)
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
      
      // Analytics et Heatmap
      { 
        path: 'reporting/analytics', 
        component: AnalyticsDashboardComponent 
      },
      { 
        path: 'reporting/heatmap', 
        component: HeatmapComponent 
      },
      
      // EXPORT - CORRIGÉ : chemin relatif (sans /admin/reporting/export)
      { 
        path: 'reporting/export', 
        component: ExportDataComponent 
      }
    ]
  },
  
  // Redirection 404
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }