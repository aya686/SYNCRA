// src/app/layouts/admin-layout/admin-layout.module.ts
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';  // ← Ajoutez DatePipe et DecimalPipe ici
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutComponent } from './admin-layout.component';

import { EventsModule } from '../../modules/events/events.module';
import { FormateursModule } from '../../modules/formateurs/formateurs.module';
import { ReportingModule } from '../../modules/reporting/reporting.module';

@NgModule({
  declarations: [
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    EventsModule,
    FormateursModule,
    ReportingModule
  ],
  providers: [
    DatePipe,      // ← Maintenant reconnu
    DecimalPipe    // ← Maintenant reconnu
  ],
  exports: [
    AdminLayoutComponent
  ]
})
export class AdminLayoutModule { }