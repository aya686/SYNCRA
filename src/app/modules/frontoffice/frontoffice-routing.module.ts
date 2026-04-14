import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { EventsListComponent } from './components/events/events-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { FormationsListComponent } from './components/formations/formations-list.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'formations', component: FormationsListComponent },
  { path: 'formations/:id', component: FormationDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { }