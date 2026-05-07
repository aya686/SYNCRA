// src/app/modules/marketplace/marketplace.module.ts
import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { RouterModule }        from '@angular/router';
import { RouterModule as RM, Routes } from '@angular/router';
import { MarketplaceComponent }  from './components/marketplace/marketplace.component';
import { CategoryPageComponent } from './components/category-page/category-page.component';

const routes: Routes = [
  { path: '',               component: MarketplaceComponent },
  { path: 'category/:key',  component: CategoryPageComponent },
];

@NgModule({
  declarations: [MarketplaceComponent, CategoryPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MarketplaceModule {}