import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-berry-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="berry-footer" [class.compact]="compact">
      <div class="footer-wrapper">
        <div class="footer-content" *ngIf="!compact">
          <div class="footer-brand" *ngIf="showBrand">
            <div class="brand">
              <i class="bi bi-grid-3x3-gap-fill brand-icon"></i>
              <span class="brand-name">{{ brandName }}</span>
            </div>
            <p class="brand-tagline" *ngIf="tagline">{{ tagline }}</p>
          </div>
          
          <div class="footer-links" *ngIf="links && links.length > 0">
            <div class="link-group" *ngFor="let group of links">
              <h6 class="group-title">{{ group.title }}</h6>
              <ul class="group-links">
                <li *ngFor="let link of group.items">
                  <a [routerLink]="link.url" *ngIf="link.url">{{ link.label }}</a>
                  <a [href]="link.externalUrl" target="_blank" *ngIf="link.externalUrl">{{ link.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            Copyright &copy; {{ currentYear }} 
            <a [routerLink]="['/']" *ngIf="brandLink">{{ brandName }}</a>
            <span *ngIf="!brandLink">{{ brandName }}</span>
            . Tous droits réservés.
          </p>
          <div class="footer-social" *ngIf="socialLinks && socialLinks.length > 0">
            <a 
              *ngFor="let social of socialLinks"
              [href]="social.url"
              target="_blank"
              class="social-link"
              [title]="social.label">
              <i [class]="'bi bi-' + social.icon"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .berry-footer {
      background: #fff;
      border-top: 1px solid #e5e7eb;
      margin-top: auto;
    }
    
    .berry-footer.compact {
      background: #f8fafc;
    }
    
    .footer-wrapper {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1.5rem;
    }
    
    .footer-brand {
      max-width: 300px;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .brand-icon {
      font-size: 1.5rem;
      color: #6366f1;
    }
    
    .brand-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }
    
    .brand-tagline {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }
    
    .footer-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2rem;
    }
    
    .link-group h6 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .group-links {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .group-links li {
      margin-bottom: 0.5rem;
    }
    
    .group-links a {
      color: #6b7280;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    
    .group-links a:hover {
      color: #3b82f6;
    }
    
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .copyright {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
    
    .copyright a {
      color: #3b82f6;
      text-decoration: none;
    }
    
    .copyright a:hover {
      text-decoration: underline;
    }
    
    .footer-social {
      display: flex;
      gap: 0.75rem;
    }
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #f3f4f6;
      color: #6b7280;
      transition: all 0.2s;
    }
    
    .social-link:hover {
      background: #3b82f6;
      color: #fff;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .footer-links {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class BerryFooterComponent {
  @Input() compact: boolean = false;
  @Input() showBrand: boolean = true;
  @Input() brandName: string = 'SYNCRA';
  @Input() tagline: string = '';
  @Input() brandLink: boolean = true;
  @Input() links: { title: string; items: { label: string; url?: string; externalUrl?: string }[] }[] = [];
  @Input() socialLinks: { icon: string; label: string; url: string }[] = [];
  
  currentYear = new Date().getFullYear();
}
