// Angular import
import { Component, output } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-left',
  imports: [NgbDropdownModule, RouterModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {
  // public props
  NavCollapsedMob = output();

  navCollapsedMob() {
    this.NavCollapsedMob.emit();
  }
}
