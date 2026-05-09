import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ml-layout/ml-layout.component').then(m => m.MlLayoutComponent),
    children: [
      { path: '', redirectTo: 'delivery', pathMatch: 'full' },
      {
        path: 'delivery',
        loadComponent: () => import('./pages/delivery-prediction/delivery-prediction.component').then(m => m.DeliveryPredictionComponent)
      },
      {
        path: 'recommendation',
        loadComponent: () => import('./pages/recommendation/recommendation.component').then(m => m.RecommendationComponent)
      },
      {
        path: 'forecast',
        loadComponent: () => import('./pages/demand-forecast/demand-forecast.component').then(m => m.DemandForecastComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MlRoutingModule { }
