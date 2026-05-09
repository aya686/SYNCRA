import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { ServiceRequest, RequestStatus, RequestType } from '../../../../models/service-request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {
  request: ServiceRequest | null = null;
  loading = false;
  showResponseModal = false;
  showCancelModal = false;
  isProvider = false;
   RequestStatus = RequestStatus;
  RequestType = RequestType;
  responseForm!: FormGroup;
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;
  private particles: Array<any> = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private requestService: ServiceRequestService
  ) {}
  
  ngOnInit(): void {
    this.initResponseForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadRequest(id);
    }
    
    // Vérifier si l'utilisateur est le fournisseur
    const currentUserId = this.getCurrentUserId();
    this.isProvider = this.request?.targetProviderId === currentUserId;
  }
  
  initResponseForm(): void {
    this.responseForm = this.fb.group({
      message: ['', Validators.required],
      proposedPrice: [0, [Validators.required, Validators.min(0)]],
      estimatedDelivery: ['', Validators.required]
    });
  }
  
  loadRequest(id: number): void {
    this.loading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (data: ServiceRequest) => {
        this.request = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement demande', err);
        this.loading = false;
        alert('Erreur lors du chargement de la demande');
      }
    });
  }
  
  getStatusBadgeClass(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.PENDING:
        return 'bg-warning text-dark';
      case RequestStatus.ACCEPTED:
        return 'bg-info';
      case RequestStatus.REJECTED:
        return 'bg-danger';
      case RequestStatus.IN_PROGRESS:
        return 'bg-primary';
      case RequestStatus.COMPLETED:
        return 'bg-success';
      case RequestStatus.CANCELLED:
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
  
  getStatusLabel(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.PENDING: return 'En attente';
      case RequestStatus.ACCEPTED: return 'Acceptée';
      case RequestStatus.REJECTED: return 'Refusée';
      case RequestStatus.IN_PROGRESS: return 'En cours';
      case RequestStatus.COMPLETED: return 'Terminée';
      case RequestStatus.CANCELLED: return 'Annulée';
      default: return status;
    }
  }
  
  getRequestTypeLabel(type: RequestType): string {
    switch(type) {
      case RequestType.FABRICATION: return 'Fabrication';
      case RequestType.SERVICE: return 'Service';
      case RequestType.MACHINE_RENT: return 'Location de machine';
      case RequestType.MACHINE_PURCHASE: return 'Achat de machine';
      case RequestType.REPARATION: return 'Réparation';
      case RequestType.CONSULTATION: return 'Consultation';
      default: return type;
    }
  }
  
  canRespond(): boolean {
    return this.isProvider && this.request?.status === RequestStatus.PENDING;
  }
  
  canCancel(): boolean {
    const currentUserId = this.getCurrentUserId();
    return (this.request?.requesterId === currentUserId || this.isProvider) && 
           this.request?.status === RequestStatus.PENDING;
  }
  
  onSubmitResponse(): void {
    if (this.responseForm.invalid) return;
    
    const response = {
      message: this.responseForm.value.message,
      proposedPrice: this.responseForm.value.proposedPrice,
      estimatedDelivery: this.responseForm.value.estimatedDelivery
    };
    
    this.loading = true;
    this.requestService.respondToRequest(this.request!.id, response).subscribe({
      next: () => {
        this.loading = false;
        this.showResponseModal = false;
        alert('✅ Réponse envoyée avec succès');
        this.loadRequest(this.request!.id);
      },
      error: (err) => {
        console.error('Erreur réponse', err);
        this.loading = false;
        alert('❌ Erreur lors de l\'envoi de la réponse');
      }
    });
  }
  
  onCancelRequest(): void {
    this.loading = true;
    this.requestService.cancelRequest(this.request!.id).subscribe({
      next: () => {
        this.loading = false;
        this.showCancelModal = false;
        alert('✅ Demande annulée');
        this.loadRequest(this.request!.id);
      },
      error: (err) => {
        console.error('Erreur annulation', err);
        this.loading = false;
        alert('❌ Erreur lors de l\'annulation');
      }
    });
  }
  
  updateStatus(status: RequestStatus): void {
    this.loading = true;
    this.requestService.updateStatus(this.request!.id, status).subscribe({
      next: () => {
        this.loading = false;
        alert(`✅ Statut mis à jour: ${this.getStatusLabel(status)}`);
        this.loadRequest(this.request!.id);
      },
      error: (err) => {
        console.error('Erreur mise à jour statut', err);
        this.loading = false;
        alert('❌ Erreur lors de la mise à jour');
      }
    });
  }
  
  formatDate(date: Date | undefined): string {
    if (!date) return 'Non spécifiée';
    return new Date(date).toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  private getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  
  downloadAttachment(url: string, fileName: string): void {
    // Implémenter le téléchargement
    window.open(url, '_blank');
  }
  ngAfterViewInit(): void {
    this.initParticles();
  }

  initParticles(): void {
    const canvas = this.particleCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.initParticleSystem();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    this.animateParticles();
  }

  initParticleSystem(): void {
    const canvas = this.particleCanvas.nativeElement;
    const particleCount = Math.min(50, Math.floor(window.innerWidth * 0.05));
    
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        originalX: Math.random() * canvas.width,
        originalY: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
        speedX: (Math.random() - 0.5) * 0.1,
        speedY: (Math.random() - 0.5) * 0.08
      });
    }
  }

  animateParticles(): void {
    const canvas = this.particleCanvas.nativeElement;
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(10, 110, 189, ${0.04 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(10, 110, 189, ${p.alpha})`;
      this.ctx.fill();
      
      p.x += p.speedX;
      p.y += p.speedY;
      p.x += (p.originalX - p.x) * 0.003;
      p.y += (p.originalY - p.y) * 0.003;
      
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    }
    
    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}