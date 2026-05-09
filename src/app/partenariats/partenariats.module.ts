import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { PostulerPartenariatComponent } from './postuler-partenariat/postuler-partenariat.component';
import { RecherchePartenariatComponent } from './recherche-partenariat/recherche-partenariat.component';
import { AdminDashboardPartenariatsComponent } from './admin-dashboard-partenariats/admin-dashboard-partenariats.component';

@NgModule({
  declarations: [
    PostulerPartenariatComponent,
    RecherchePartenariatComponent,
    AdminDashboardPartenariatsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    RouterModule.forChild([
      {
        path: 'postuler-partenariat',
        component: PostulerPartenariatComponent
      },
      {
        path: 'recherche-partenariat',
        component: RecherchePartenariatComponent
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardPartenariatsComponent
      }
    ])
  ]
})
export class PartenariatsModule { }
