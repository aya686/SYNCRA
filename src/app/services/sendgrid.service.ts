import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class SendgridService {
  private publicKey = 'DvDXAovILS92vyoP4';
  private serviceId = 'service_rrxgrxq';
  private templateId = 'template_ld419sn';

  constructor() {
    emailjs.init(this.publicKey);
  }

  sendNegotiationEmail(nom: string, prenom: string, description: string, projetNom: string): Observable<any> {
    const templateParams = {
      to_name: 'Destinataire',
      from_name: 'BERRY Platform',
      nom: nom,
      prenom: prenom,
      projet: projetNom,
      description: description,
      to_email: 'taibkaddour5@gmail.com'
    };

    return new Observable(observer => {
      emailjs.send(this.serviceId, this.templateId, templateParams)
        .then((response) => {
          console.log('Email envoyé avec succès!', response.status, response.text);
          observer.next({
            success: true,
            message: 'Email envoyé avec succès',
            response: response
          });
          observer.complete();
        }, (error) => {
          console.error('Erreur lors de l\'envoi de l\'email:', error);
          observer.error(error);
        });
    });
  }
}
