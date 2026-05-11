import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { FormateurListComponent } from './formateur-list/formateur-list.component';
import { FormateurFormComponent } from './formateur-form/formateur-form.component';

@NgModule({
  declarations: [
    FormateurListComponent,
    FormateurFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule
  ],
  providers: [DecimalPipe],
  exports: [
    FormateurListComponent,
    FormateurFormComponent
  ]
})
export class FormateursModule {}