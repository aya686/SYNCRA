import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { CategoryPageComponent } from './components/category-page/category-page.component';

const routes: Routes = [
  { path: '', component: MarketplaceComponent },
  { path: 'category/:key', component: CategoryPageComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MarketplaceComponent,
    CategoryPageComponent
  ]
})
export class MarketplaceModule {}