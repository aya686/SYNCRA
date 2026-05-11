import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { JitsiMeetComponent } from './components/jitsi-meet/jitsi-meet.component';
import { SecretCodeModalComponent } from './components/secret-code-modal/secret-code-modal.component';
import { UserTypeModalComponent } from './components/user-type-modal/user-type-modal.component';

@NgModule({
  declarations: [
    JitsiMeetComponent,
    SecretCodeModalComponent,
    UserTypeModalComponent
  ],
  imports: [
    CommonModule,       // ← CommonModule inclut déjà DatePipe et DecimalPipe
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    DatePipe,           // ← ici pour injection dans les services/composants
    DecimalPipe
  ],
  exports: [
    CommonModule,       // ← exporte CommonModule = exporte DatePipe, DecimalPipe, NgIf, NgFor...
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    JitsiMeetComponent,
    SecretCodeModalComponent,
    UserTypeModalComponent
  ]
})
export class SharedModule {}