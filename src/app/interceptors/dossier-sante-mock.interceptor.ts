import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface Antecedent {
  id: number;
  type: string;
  description: string;
}

interface Consultation {
  id: number;
  date: string;
  heure: string;
  motif: string;
}

interface DocumentMedical {
  id: number;
  nom: string;
  type: string;
  url: string;
}

interface DossierSante {
  id: number;
  utilisateurId: number;
  groupeSanguin: string;
  genre: string;
  dateCreation: string;
  antecedents: Antecedent[];
  consultations: Consultation[];
  documentsMedicaux: DocumentMedical[];
}

@Injectable()
export class DossierSanteMockInterceptor implements HttpInterceptor {
  private readonly storageKey = 'mock-dossiers-sante';
  private readonly apiPattern = /\/api\/dossier-sante(?:\/\d+)?$/;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!environment.useMockDossierSanteApi || !this.apiPattern.test(req.url)) {
      return next.handle(req);
    }

    const dossiers = this.readDossiers();

    if (req.method === 'GET') {
      const id = this.extractId(req.url);
      if (id === null) {
        return this.ok(dossiers);
      }

      const dossier = dossiers.find((item) => item.id === id);
      return this.ok(dossier ?? null);
    }

    if (req.method === 'POST') {
      const payload = this.normalizeDossier(req.body as Partial<DossierSante>);
      const created: DossierSante = {
        ...payload,
        id: this.nextId(dossiers)
      };

      dossiers.push(created);
      this.writeDossiers(dossiers);
      return this.ok(created);
    }

    if (req.method === 'PUT') {
      const id = this.extractId(req.url);
      if (id === null) {
        return this.ok({ message: 'ID manquant' }, 400);
      }

      const payload = this.normalizeDossier(req.body as Partial<DossierSante>);
      const index = dossiers.findIndex((item) => item.id === id);

      if (index === -1) {
        const created: DossierSante = { ...payload, id };
        dossiers.push(created);
        this.writeDossiers(dossiers);
        return this.ok(created);
      }

      dossiers[index] = { ...payload, id };
      this.writeDossiers(dossiers);
      return this.ok(dossiers[index]);
    }

    if (req.method === 'DELETE') {
      const id = this.extractId(req.url);
      if (id === null) {
        return this.ok({ message: 'ID manquant' }, 400);
      }

      const filtered = dossiers.filter((item) => item.id !== id);
      this.writeDossiers(filtered);
      return this.ok(null);
    }

    return next.handle(req);
  }

  private readDossiers(): DossierSante[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      const seed = this.seedDossiers();
      this.writeDossiers(seed);
      return seed;
    }

    try {
      const parsed = JSON.parse(stored) as DossierSante[];
      return Array.isArray(parsed) ? parsed.map((item) => this.normalizeDossier(item)) : this.seedDossiers();
    } catch {
      const seed = this.seedDossiers();
      this.writeDossiers(seed);
      return seed;
    }
  }

  private writeDossiers(dossiers: DossierSante[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(dossiers));
  }

  private seedDossiers(): DossierSante[] {
    return [
      {
        id: 2,
        utilisateurId: 1,
        groupeSanguin: 'A+',
        genre: 'Homme',
        dateCreation: new Date().toISOString().split('T')[0],
        antecedents: [],
        consultations: [],
        documentsMedicaux: []
      }
    ];
  }

  private normalizeDossier(data: Partial<DossierSante>): DossierSante {
    return {
      id: Number(data.id) || 0,
      utilisateurId: Number(data.utilisateurId) || 1,
      groupeSanguin: data.groupeSanguin || 'A+',
      genre: data.genre || 'Homme',
      dateCreation: data.dateCreation || new Date().toISOString().split('T')[0],
      antecedents: Array.isArray(data.antecedents) ? data.antecedents : [],
      consultations: Array.isArray(data.consultations) ? data.consultations : [],
      documentsMedicaux: Array.isArray(data.documentsMedicaux) ? data.documentsMedicaux : []
    };
  }

  private extractId(url: string): number | null {
    const match = url.match(/\/(\d+)(?:\?.*)?$/);
    return match ? Number(match[1]) : null;
  }

  private nextId(dossiers: DossierSante[]): number {
    return dossiers.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  private ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
    return of(new HttpResponse({ status, body }));
  }
}
