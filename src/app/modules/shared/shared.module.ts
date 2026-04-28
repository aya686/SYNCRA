import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Components
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
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    JitsiMeetComponent,
    SecretCodeModalComponent,
    UserTypeModalComponent
  ]
})
export class SharedModule { }