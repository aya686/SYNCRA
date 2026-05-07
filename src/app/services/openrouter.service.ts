import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, timeout, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = environment.openRouterApiKey;

  constructor(private http: HttpClient) {}

  analyserInvestissement(demande: {
    montant: number;
    projetId: number;
    dateSoumission: string;
    investisseurId: number;
  }): Observable<{ pourcentage: number; cause: string }> {
    const prompt = `Analyse cette demande d'investissement et donne un pourcentage d'acceptation (0-100) avec la cause.

Détails de la demande:
- Montant: ${demande.montant} TND
- ID Projet: ${demande.projetId}
- Date de soumission: ${demande.dateSoumission}
- ID Investisseur: ${demande.investisseurId}

Réponds UNIQUEMENT au format JSON suivant:
{
  "pourcentage": nombre entre 0 et 100,
  "cause": "explication courte de la décision"
}

Considère:
- La cohérence du montant par rapport au marché
- Le timing de l'investissement
- Le profil de l'investisseur
- Les risques potentiels`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'Berry Platform'
    });

    const body = {
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      timeout(30000), // Timeout de 30 secondes
      map((response: any) => {
        console.log('Réponse complète de l\'API OpenRouter:', response);
        try {
          const content = response.choices?.[0]?.message?.content;
          console.log('Contenu de la réponse:', content);
          if (!content) {
            console.error('Structure de réponse invalide:', response);
            return { pourcentage: 50, cause: 'Réponse vide de l\'IA' };
          }
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { pourcentage: parsed.pourcentage, cause: parsed.cause };
          }
          console.error('Format de réponse invalide, contenu:', content);
          return { pourcentage: 50, cause: 'Format de réponse invalide' };
        } catch (e) {
          console.error('Erreur parsing:', e);
          return { pourcentage: 50, cause: 'Erreur de parsing de la réponse' };
        }
      }),
      catchError((error) => {
        console.error('Erreur API OpenRouter:', error);
        // Retourner une valeur par défaut en cas d'erreur
        return of({
          pourcentage: this.calculerPourcentageParDefaut(demande.montant),
          cause: 'Analyse IA non disponible - estimation basée sur le montant'
        });
      })
    );
  }

  // Méthode de secours pour calculer un pourcentage basé sur le montant
  private calculerPourcentageParDefaut(montant: number): number {
    if (montant < 10000) return 85;
    if (montant < 50000) return 70;
    if (montant < 100000) return 55;
    return 40;
  }
}
