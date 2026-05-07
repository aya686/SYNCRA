import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-investisseur-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './investisseur-home.component.html',
  styleUrls: ['./investisseur-home.component.scss']
})
export class InvestisseurHomeComponent {}
