import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Formateur Components
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
    RouterModule
  ],
  exports: [
    FormateurListComponent,
    FormateurFormComponent
  ]
})
export class FormateursModule { }