import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResourcesRoutingModule } from './resources-routing.module';
import { MachineListComponent } from './components/machine-list/machine-list.component';
import { MachineDetailComponent } from './components/machine-detail/machine-detail.component';
import { CreateMachineComponent } from './components/create-machine/create-machine.component';
import { RecommendationPanelComponent } from './components/recommendation-panel/recommendation-panel.component';
import { ReviewsModule } from '../reviews/reviews.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ResourcesRoutingModule,
    ReviewsModule,
    MachineListComponent,
    MachineDetailComponent,
    CreateMachineComponent,
    RecommendationPanelComponent
  ]
})
export class ResourcesModule { }