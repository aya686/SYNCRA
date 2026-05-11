// register.component.ts
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private cd = inject(ChangeDetectorRef);

  submitted = signal(false);
  error = signal('');
  showPassword = signal(false);

  registerModel = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  onSubmit(form: any) {
    this.submitted.set(true);
    this.error.set('');
    
    if (form.valid) {
      const credentials = this.registerModel;
      console.log('register user logged in with:', credentials);
    }
    
    this.cd.detectChanges();
  }
}