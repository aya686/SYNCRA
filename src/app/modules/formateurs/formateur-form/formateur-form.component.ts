import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formateur-form',
  standalone: true,  // ← AJOUTER standalone
  imports: [CommonModule, FormsModule, RouterModule],  // ← AJOUTER imports
  templateUrl: './formateur-form.component.html',
  styleUrls: ['./formateur-form.component.css']
})
export class FormateurFormComponent implements OnInit {
  formateur: any = {
    expertise: '',
    bio: '',
    noteMoyenne: 0
  };
  
  isEditMode: boolean = false;
  formateurId: number = 0;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.formateurId = +params['id'];
        this.loadFormateur();
      }
    });
  }

  loadFormateur(): void {
    this.loading = true;
    this.http.get(`http://localhost:8089/event_db/api/formateurs/${this.formateurId}`).subscribe({
      next: (data: any) => {
        this.formateur = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;
    
    if (form.invalid) {
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.http.put(`http://localhost:8089/event_db/api/formateurs/${this.formateurId}`, this.formateur).subscribe({
        next: () => {
          this.router.navigate(['/admin/formateurs']);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
    } else {
      this.http.post('http://localhost:8089/event_db/api/formateurs', this.formateur).subscribe({
        next: () => {
          this.router.navigate(['/admin/formateurs']);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/formateurs']);
  }
}