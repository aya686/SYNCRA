import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FrontOfficeRoutingModule } from './frontoffice-routing.module';
import { SharedModule } from '../shared/shared.module';

// Composants (tous sont standalone maintenant)
import { HomeComponent } from './components/home/home.component';
import { EventsListComponent } from './components/events/events-list.component';
import { EventDetailComponent } from './components/event-detail/event-detail.component';
import { MapViewerComponent } from './components/event-detail/map-viewer.component';
import { FormationsListComponent } from './components/formations/formations-list.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';
import { InscriptionFormationComponent } from './components/inscription-formation/inscription-formation.component';
import { InscriptionFormComponent } from './components/inscription/inscription-form.component';
import { SimulationDashboardComponent } from './components/simulation-dashboard/simulation-dashboard.component';

// Services
import { PublicEventService } from './services/public-event.service';
import { PublicFormationService } from './services/public-formation.service';

@NgModule({
  declarations: [
    HomeComponent,
    EventsListComponent,
    EventDetailComponent,
    MapViewerComponent,
    FormationsListComponent,
    FormationDetailComponent,
    FavoritesListComponent,
    InscriptionFormationComponent,
    InscriptionFormComponent,
    SimulationDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    FrontOfficeRoutingModule
  ],
  providers: [
    PublicEventService,
    PublicFormationService
  ],
  exports: [
    HomeComponent,
    EventsListComponent,
    EventDetailComponent,
    MapViewerComponent,
    FormationsListComponent,
    FormationDetailComponent,
    FavoritesListComponent,
    InscriptionFormationComponent,
    InscriptionFormComponent,
    SimulationDashboardComponent
  ]
})
export class FrontOfficeModule { }