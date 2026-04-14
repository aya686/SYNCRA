import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FrontOfficeRoutingModule } from './frontoffice-routing.module';

// Composants (tous sont standalone maintenant)
import { HomeComponent } from './components/home/home.component';
import { EventsListComponent } from './components/events/events-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { FormationsListComponent } from './components/formations/formations-list.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';

// Services
import { PublicEventService } from './services/public-event.service';
import { PublicFormationService } from './services/public-formation.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FrontOfficeRoutingModule,
    // Composants standalone
    HomeComponent,
    EventsListComponent,
    EventDetailComponent,
    FormationsListComponent,
    FormationDetailComponent
  ],
  providers: [
    PublicEventService,
    PublicFormationService
  ]
})
export class FrontOfficeModule { }