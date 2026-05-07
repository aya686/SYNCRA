// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 { path: '', redirectTo: '/marketplace', pathMatch: 'full' },
  { 
    path: 'machines', 
    loadChildren: () => import('./modules/resources/resources.module').then(m => m.ResourcesModule)
  },
  { 
    path: 'services', 
    loadChildren: () => import('./modules/services/services.module').then(m => m.ServicesModule)
  },
  { 
    path: 'requests', 
    loadChildren: () => import('./modules/requests/requests.module').then(m => m.RequestsModule)
  },
  {  path: 'cart', 
    loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./modules/marketplace/marketplace.module')
      .then(m => m.MarketplaceModule)
  },
  { path: 'orders',   loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule) },
  { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
  {
    path: 'loyalty',
    loadChildren: () => import('./modules/loyalty/loyalty.module').then(m => m.LoyaltyModule)
  },
  { path: '**', redirectTo: '/marketplace' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }