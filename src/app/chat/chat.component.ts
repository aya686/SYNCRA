import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/chat-message.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage = '';
  currentUserId: number = 0; // À récupérer depuis l'authentification
  otherUserId: number = 0;
  currentUserRole: 'CLIENT' | 'FREELANCER' = 'CLIENT';
  contratId?: number;
  loading = false;
  error = '';
  refreshSubscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'autre utilisateur depuis les paramètres de route
    this.otherUserId = +this.route.snapshot.paramMap.get('otherUserId') || 0;
    this.contratId = this.route.snapshot.paramMap.get('contratId') ? 
      +this.route.snapshot.paramMap.get('contratId')! : undefined;
    
    // Récupérer le rôle de l'utilisateur depuis les paramètres de route
    const role = this.route.snapshot.paramMap.get('role');
    if (role === 'CLIENT' || role === 'FREELANCER') {
      this.currentUserRole = role;
    }

    // TODO: Récupérer l'ID de l'utilisateur connecté depuis l'authentification
    // Pour l'instant, on utilise une valeur par défaut
    this.currentUserId = this.currentUserRole === 'CLIENT' ? 1 : 2;
    
    // Définir l'ID de l'autre utilisateur (client = 1, freelancer = 2)
    this.otherUserId = this.currentUserRole === 'CLIENT' ? 2 : 1;

    this.loadMessages();

    // Rafraîchir automatiquement les messages toutes les 3 secondes
    this.refreshSubscription = interval(3000).subscribe(() => {
      this.loadMessages();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    console.log('Rafraîchissement des messages...');
    this.loading = true;
    // Charger les messages entre le client (1) et le freelancer (2)
    this.chatService.getMessages(1, 2).subscribe({
      next: (data) => {
        console.log('Messages reçus:', data);
        this.messages = data;
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Erreur chargement messages:', err);
        this.error = 'Erreur lors du chargement des messages';
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const message: ChatMessage = {
      contenu: this.newMessage,
      expediteurId: this.currentUserId,
      destinataireId: this.otherUserId,
      expediteurRole: this.currentUserRole,
      contratId: this.contratId,
      lu: false
    };

    this.chatService.sendMessage(message).subscribe({
      next: (sentMessage) => {
        this.messages.push(sentMessage);
        this.newMessage = '';
        // Scroll vers le bas pour voir le nouveau message
        this.scrollToBottom();
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'envoi du message';
      }
    });
  }

  scrollToBottom(): void {
    // Scroll vers le bas de la liste des messages
    setTimeout(() => {
      const element = document.getElementById('messages-container');
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  isMessageFromCurrentUser(message: ChatMessage): boolean {
    return message.expediteurId === this.currentUserId;
  }

  annuler(): void {
    this.router.navigate([this.currentUserRole === 'CLIENT' ? '/client' : '/freelancer']);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
