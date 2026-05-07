// src/app/modules/resources/resources-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MachineListComponent } from './components/machine-list/machine-list.component';
import { MachineDetailComponent } from './components/machine-detail/machine-detail.component';
import { CreateMachineComponent } from './components/create-machine/create-machine.component';
import { RecommendationPanelComponent } from './components/recommendation-panel/recommendation-panel.component';

const routes: Routes = [

    { path: 'recommendation', component: RecommendationPanelComponent },
  { path: 'create', component: CreateMachineComponent },
  
  // Routes paramétrées (avec :id) - à la fin
  { path: '', component: MachineListComponent },
  { path: ':id', component: MachineDetailComponent },
  { path: 'edit/:id', component: CreateMachineComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule { }