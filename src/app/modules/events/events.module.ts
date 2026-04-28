import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Event Components
import { EventListComponent } from './components/event-list/event-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { MapPickerComponent } from './components/event-form/map-picker.component';

const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'new', component: EventFormComponent },
  { path: ':id', component: EventDetailComponent },
  { path: ':id/edit', component: EventFormComponent }
];

@NgModule({
  declarations: [
    EventListComponent,
    EventDetailComponent,
    EventFormComponent,
    MapPickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    EventListComponent,
    EventDetailComponent,
    EventFormComponent,
    MapPickerComponent
  ]
})
export class EventsModule { }