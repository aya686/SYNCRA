import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat'; // Ajuster selon votre API backend
  private localStorageKey = 'chat_messages';

  constructor(private http: HttpClient) {}

  // Récupérer tous les messages entre deux utilisateurs
  getMessages(userId1: number, userId2: number): Observable<ChatMessage[]> {
    // Solution de repli avec localStorage
    const messages = this.getMessagesFromLocalStorage();
    const filteredMessages = messages.filter(
      (m) =>
        (m.expediteurId === userId1 && m.destinataireId === userId2) ||
        (m.expediteurId === userId2 && m.destinataireId === userId1)
    );
    return of(filteredMessages);

    // Uncomment quand le backend est prêt
    // return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/${userId1}/${userId2}`);
  }

  // Récupérer les messages d'un contrat spécifique
  getMessagesByContrat(contratId: number): Observable<ChatMessage[]> {
    // Solution de repli avec localStorage
    const messages = this.getMessagesFromLocalStorage();
    const filteredMessages = messages.filter((m) => m.contratId === contratId);
    return of(filteredMessages);

    // Uncomment quand le backend est prêt
    // return this.http.get<ChatMessage[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  // Envoyer un message
  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    // Solution de repli avec localStorage
    const messages = this.getMessagesFromLocalStorage();
    const newMessage: ChatMessage = {
      ...message,
      id: messages.length + 1,
      dateEnvoi: new Date().toISOString()
    };
    messages.push(newMessage);
    this.saveMessagesToLocalStorage(messages);
    return of(newMessage);

    // Uncomment quand le backend est prêt
    // return this.http.post<ChatMessage>(`${this.apiUrl}/send`, message);
  }

  // Marquer un message comme lu
  markAsRead(messageId: number): Observable<void> {
    // Solution de repli avec localStorage
    const messages = this.getMessagesFromLocalStorage();
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].lu = true;
      this.saveMessagesToLocalStorage(messages);
    }
    return of(undefined);

    // Uncomment quand le backend est prêt
    // return this.http.put<void>(`${this.apiUrl}/read/${messageId}`, {});
  }

  // Récupérer les messages non lus pour un utilisateur
  getUnreadMessages(userId: number): Observable<ChatMessage[]> {
    // Solution de repli avec localStorage
    const messages = this.getMessagesFromLocalStorage();
    const unreadMessages = messages.filter(
      (m) => m.destinataireId === userId && !m.lu
    );
    return of(unreadMessages);

    // Uncomment quand le backend est prêt
    // return this.http.get<ChatMessage[]>(`${this.apiUrl}/unread/${userId}`);
  }

  // Méthodes utilitaires pour localStorage
  private getMessagesFromLocalStorage(): ChatMessage[] {
    const messages = localStorage.getItem(this.localStorageKey);
    return messages ? JSON.parse(messages) : [];
  }

  private saveMessagesToLocalStorage(messages: ChatMessage[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(messages));
  }
}
