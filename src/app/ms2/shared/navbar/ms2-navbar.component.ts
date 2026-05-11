import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlerteService } from '../../services/alerte.service';

@Component({
  selector: 'app-ms2-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './ms2-navbar.component.html',
  styleUrls: ['./ms2-navbar.component.scss']
})
export class Ms2NavbarComponent implements OnInit {
  menuOuvert = false;
  nbAlertes = 0;
  readonly USER_ID = 1;

  constructor(private alerteService: AlerteService) {}

  ngOnInit(): void {
    this.chargerAlertes();
  }

  chargerAlertes(): void {
    this.alerteService.getNonTraitees(this.USER_ID).subscribe({
      next: (a) => this.nbAlertes = a.length,
      error: () => this.nbAlertes = 0
    });
  }
}