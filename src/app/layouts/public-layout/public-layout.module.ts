import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicLayoutComponent } from './public-layout.component';

@NgModule({
  declarations: [
    PublicLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    PublicLayoutComponent
  ]
})
export class PublicLayoutModule { }
