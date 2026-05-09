import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailgunService {
  private apiUrl = 'https://api.mailgun.net/v3/sandbox0f920a5446fc4409876ca1098423daa2.mailgun.org/messages';
  private apiKey = '11032821200c84d8b9face831a3ebe84';
  private domain = 'sandbox0f920a5446fc4409876ca1098423daa2.mailgun.org';

  constructor(private http: HttpClient) {}

  sendNegotiationEmail(nom: string, prenom: string, description: string, projetNom: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Basic ${btoa('api:' + this.apiKey)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('from', 'noreply@berry-platform.com');
    body.set('to', 'taibkaddour5@gmail.com');
    body.set('subject', `Nouvelle demande de négociation - Projet: ${projetNom}`);
    body.set('text', `
Nouvelle demande de négociation reçue

Informations de la personne:
- Nom: ${nom}
- Prénom: ${prenom}

Description:
${description}

Projet concerné: ${projetNom}

---
Ceci est un email automatique envoyé depuis la plateforme BERRY.
    `);

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
