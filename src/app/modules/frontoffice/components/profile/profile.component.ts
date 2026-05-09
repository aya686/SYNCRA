// src/app/modules/frontoffice/components/profile/profile.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-page">
      <div class="container">
        <h1>Mon Profil</h1>
        <p>Espace personnel de l'utilisateur</p>
        <div class="profile-info">
          <h3>Mes inscriptions</h3>
          <p>Aucune inscription pour le moment</p>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {}