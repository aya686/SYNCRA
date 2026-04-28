import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formateur-list',
  templateUrl: './formateur-list.component.html',
  styleUrls: ['./formateur-list.component.css']
})
export class FormateurListComponent implements OnInit {
  formateurs: any[] = [];
  filteredFormateurs: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  starArray: number[] = [1, 2, 3, 4, 5];

  get totalFormateurs(): number {
    return this.formateurs.length;
  }

  get topFormateurs(): number {
    return this.formateurs.filter(f => f.noteMoyenne >= 4).length;
  }

  constructor(
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadFormateurs();
  }

  loadFormateurs(): void {
    this.loading = true;
    this.http.get('http://localhost:8089/event_db/api/formateurs').subscribe({
      next: (data: any) => {
        this.formateurs = data;
        this.filteredFormateurs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  filterFormateurs(): void {
    this.filteredFormateurs = this.formateurs.filter(formateur => {
      return !this.searchTerm || 
        formateur.expertise?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        formateur.bio?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  deleteFormateur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) {
      this.http.delete(`http://localhost:8089/event_db/api/formateurs/${id}`).subscribe({
        next: () => {
          this.loadFormateurs();
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
    }
  }

  getNoteDisplay(note: number): string {
    return note ? note.toString() : 'N/A';
  }

  getBioDisplay(bio: string): string {
    return bio || 'Aucune biographie disponible';
  }
}