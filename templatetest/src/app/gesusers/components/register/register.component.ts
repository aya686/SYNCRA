import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  
  selectedRoles = new Set<string>();

  constructor(private router: Router) {}

  toggleRole(roleId: string): void {
    if (this.selectedRoles.has(roleId)) {
      this.selectedRoles.delete(roleId);
    } else {
      this.selectedRoles.add(roleId);
    }
  }

  isSelected(roleId: string): boolean {
    return this.selectedRoles.has(roleId);
  }

  nextStep(): void {
    if (this.selectedRoles.size === 0) return;
    
    localStorage.setItem('selectedRoles', JSON.stringify([...this.selectedRoles]));
    // ✅ CORRECTION : Utiliser la route définie dans app-routing.module.ts
    this.router.navigate(['/users/register/details']);
  }
}