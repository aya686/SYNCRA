import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FormateurListComponent } from './formateur-list/formateur-list.component';
import { FormateurFormComponent } from './formateur-form/formateur-form.component';
import { SharedModule } from '../shared/shared.module';  // ← ajoute ça

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
    DecimalPipe,
        SharedModule   // ← ajoute ça

  ],
  exports: [
    FormateurListComponent,
    FormateurFormComponent
  ]
})
export class FormateursModule { }