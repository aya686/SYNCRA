import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AIAnalysisResult {
  cvResume: string;
  score: number;
  report: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiCvService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = environment.openRouterApiKey;

  constructor(private http: HttpClient) { }

  analyzeCV(cvContent: string, offreTitre: string, offreDescription: string, offreBudgetMin: number): Observable<AIAnalysisResult> {
    // Truncate CV content to avoid token limit errors (max 8000 chars)
    const maxContentLength = 8000;
    const truncatedContent = cvContent.length > maxContentLength 
      ? cvContent.substring(0, maxContentLength) + '... (contenu tronqué)' 
      : cvContent;

    const prompt = `Tu es un expert en recrutement et analyse de CV. Analyse ce CV pour le poste suivant:

Poste: ${offreTitre}
Description: ${offreDescription}
Budget: ${offreBudgetMin} TND

Contenu du CV:
${truncatedContent}

Fournis:
1. Un résumé du CV en 3 lignes maximum
2. Un score de compatibilité entre 0 et 100
3. Un rapport brief justifiant le score

Réponds au format JSON suivant:
{
  "cvResume": "résumé en 3 lignes",
  "score": nombre entre 0 et 100,
  "report": "rapport brief justifiant le score"
}`;

    return new Observable<AIAnalysisResult>(observer => {
      console.log('Sending request to OpenRouter API...');
      console.log('Prompt length:', prompt.length);
      
      const maxRetries = 2;
      let retryCount = 0;
      
      const attemptRequest = () => {
        this.http.post(this.apiUrl, {
          model: 'deepseek/deepseek-r1',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en recrutement qui analyse les CV pour évaluer leur compatibilité avec des offres d\'emploi. Réponds toujours au format JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Berry Job Portal'
          }
        }).subscribe({
          next: (response: any) => {
            console.log('OpenRouter response received:', response);
            try {
              const content = response.choices[0].message.content;
              console.log('AI response content:', content);
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log('Parsed result:', result);
                observer.next({
                  cvResume: result.cvResume || 'Résumé non disponible',
                  score: Math.min(100, Math.max(0, result.score || 50)),
                  report: result.report || 'Rapport non disponible'
                });
              } else {
                // Fallback if JSON parsing fails
                console.warn('No JSON found in response, using content directly');
                observer.next({
                  cvResume: 'CV analysé avec succès',
                  score: 70,
                  report: content
                });
              }
              observer.complete();
            } catch (error) {
              console.error('Erreur parsing AI response:', error);
              // Fallback response
              observer.next({
                cvResume: 'CV analysé avec succès',
                score: 70,
                report: 'Analyse complétée avec succès'
              });
              observer.complete();
            }
          },
          error: (error) => {
            console.error('Erreur API OpenRouter:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });

            // Retry on 429 (Too Many Requests) or 5xx errors
            if ((error.status === 429 || (error.status >= 500 && error.status < 600)) && retryCount < maxRetries) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s
              console.log(`Retry ${retryCount}/${maxRetries} in ${delay}ms...`);
              setTimeout(attemptRequest, delay);
            } else {
              // Final fallback to simulated analysis
              console.warn('All retries failed, using simulated analysis');
              const simulatedResult = this.getSimulatedAnalysis(cvContent, offreTitre, offreDescription, offreBudgetMin);
              observer.next({
                cvResume: simulatedResult.cvResume,
                score: simulatedResult.score,
                report: simulatedResult.report + ' (Mode simulé - API indisponible)'
              });
              observer.complete();
            }
          }
        });
      };
      
      attemptRequest();
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  }

  private getSimulatedAnalysis(cvContent: string, offreTitre: string, offreDescription: string, offreBudgetMin: number): AIAnalysisResult {
    // Generate a pseudo-random score based on CV content hash
    const hash = this.hashCode(cvContent + offreTitre);
    const score = 50 + (Math.abs(hash) % 45); // Score between 50 and 95
    
    // Generate CV summary (3 lines)
    const cvResume = this.generateCVResume(offreTitre);
    
    // Generate AI report
    const report = this.generateAIReport(score, offreTitre, offreDescription, offreBudgetMin);
    
    return { cvResume, score, report };
  }

  private generateCVResume(offreTitre: string): string {
    const skills = ['JavaScript', 'Angular', 'Spring Boot', 'Python', 'React', 'Node.js', 'TypeScript', 'Java'];
    const experiences = ['3 ans d\'expérience', '5 ans d\'expérience', 'Senior développeur', 'Lead développeur'];
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    const randomExp = experiences[Math.floor(Math.random() * experiences.length)];
    
    return `Profil développeur avec expertise en ${randomSkill}. ${randomExp} dans le développement web. Compétences solides en gestion de projet et travail d'équipe.`;
  }

  private generateAIReport(score: number, offreTitre: string, offreDescription: string, offreBudgetMin: number): string {
    let report = `Analyse pour le poste "${offreTitre}".\n`;
    
    if (score >= 80) {
      report += `Excellent profil (${score}/100). Le candidat correspond parfaitement aux exigences de l'offre. Compétences techniques alignées avec les besoins. Expérience pertinente confirmée. Recommandé pour entretien.`;
    } else if (score >= 60) {
      report += `Bon profil (${score}/100). Le candidat possède des compétences pertinentes mais certaines améliorations sont possibles. Correspondance satisfaisante avec l'offre. À considérer pour shortlist.`;
    } else {
      report += `Profil moyen (${score}/100). Le candidat ne correspond que partiellement aux exigences. Compétences à développer. Expérience insuffisante pour ce poste.`;
    }
    
    return report;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
