import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = environment.openRouterApiKey;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, context?: string): Observable<any> {
    console.log('🤖 Chatbot: Envoi du message à l\'API');
    console.log('Message:', message);
    console.log('Contexte:', context);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-OpenRouter-Title': 'BERRY Investment Platform'
    });

    const systemPrompt = context
      ? `Tu es un assistant IA expert en investissement pour la plateforme BERRY. Voici le contexte des projets d'investissement disponibles: ${context}. Réponds aux questions de l'investisseur de manière professionnelle et informative.`
      : 'Tu es un assistant IA expert en investissement pour la plateforme BERRY. Aide les investisseurs à comprendre les projets d\'investissement disponibles, les risques, les retours sur investissement et les opportunités. Réponds de manière professionnelle et informative.';

    const body = {
      model: 'deepseek/deepseek-chat', // Modèle plus rapide que deepseek-r1
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ]
    };

    console.log('🤖 Chatbot: Body de la requête:', JSON.stringify(body));

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      timeout(30000), // 30 secondes timeout (réduit pour éviter d'attendre trop longtemps)
      catchError((error) => {
        console.error('❌ Chatbot: Erreur lors de l\'appel API:', error);
        console.error('❌ Chatbot: Status:', error.status);
        console.error('❌ Chatbot: Message:', error.message);
        console.error('❌ Chatbot: Error name:', error.name);
        console.error('❌ Chatbot: Error details:', error.error);

        // Fallback response if API fails
        if (error.status === 401) {
          return of({
            error: true,
            message: 'Erreur d\'authentification avec l\'API. Veuillez vérifier la clé API.'
          });
        } else if (error.status === 429) {
          return of({
            error: true,
            message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
          });
        } else if (error.status === 0 || error.name === 'TimeoutError') {
          return of({
            error: true,
            message: 'Délai d\'attente dépassé. L\'API OpenRouter ne répond pas. Vérifiez votre connexion internet ou réessayez plus tard.'
          });
        }

        return of({
          error: true,
          message: `Erreur de communication: ${error.message || 'Erreur inconnue'}`
        });
      })
    );
  }
}
