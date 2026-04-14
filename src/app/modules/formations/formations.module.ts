import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormationListComponent } from './components/formation-list/formation-list.component';
import { FormationFormComponent } from './components/formation-form/formation-form.component';
import { SessionFormComponent } from './components/session-form/session-form.component';
import { SessionDetailComponent } from './components/session-detail/session-detail.component';

const routes: Routes = [
  { path: '', component: FormationListComponent },
  { path: 'new', component: FormationFormComponent },
  { path: ':id/edit', component: FormationFormComponent },
  { path: 'sessions/new/:formationId', component: SessionFormComponent },
  { path: 'sessions/:id', component: SessionDetailComponent },
  { path: 'sessions/:id/edit', component: SessionFormComponent }
];

@NgModule({
  declarations: [
    FormationListComponent,
    FormationFormComponent,
    SessionFormComponent,
    SessionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)  // Ceci est relatif à /admin/formations
  ]
})
export class FormationsModule { }