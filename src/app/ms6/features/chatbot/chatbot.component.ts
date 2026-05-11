import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, timeout, catchError, of } from 'rxjs';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  sentimentScore?: number;
  entities?: { [key: string]: string };
  suggestions?: string[];
  isTyping?: boolean;
}

interface ChatbotResponse {
  intent: string;
  intentDescription: string;
  response: string;
  entities: { [key: string]: string };
  sentimentScore: number;
  sentimentLabel: string;
  confidence: number;
  suggestions: string[];
  originalMessage: string;
  userId: number;
  timestamp: string;
  processingTimeMs: number;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <!-- Header -->
      <div class="chatbot-header">
        <div class="bot-info">
          <div class="bot-avatar">
            <i class="bi bi-robot"></i>
            <span class="status-dot online"></span>
          </div>
          <div class="bot-details">
            <h3>SyncraBot</h3>
            <span class="bot-status">En ligne • NLP Actif</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-icon btn-force-refresh" (click)="forceDisplayResults()" title="Forcer l'affichage des résultats">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn-icon" (click)="clearChat()" title="Effacer la conversation">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn-icon" (click)="toggleNLPInfo()" title="Info NLP">
            <i class="bi bi-info-circle"></i>
          </button>
        </div>
      </div>

      <!-- NLP Info Panel (collapsible) -->
      <div class="nlp-info-panel" *ngIf="showNLPInfo">
        <div class="info-header">
          <h4><i class="bi bi-cpu"></i> Intelligence Artificielle</h4>
          <button class="btn-close" (click)="toggleNLPInfo()">x</button>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">Algorithme:</span>
            <span class="info-value">TF-IDF + Similarité Cosinus</span>
          </div>
          <div class="info-item">
            <span class="info-label">Intentions:</span>
            <span class="info-value">11 types reconnus</span>
          </div>
          <div class="info-item">
            <span class="info-label">Features:</span>
            <span class="info-value">NER, Sentiment Analysis, Stemming</span>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-area" #messagesContainer>
        <div class="welcome-message" *ngIf="messages.length === 0">
          <div class="welcome-icon">👋</div>
          <h3>Bienvenue !</h3>
          <p>Je suis <strong>SyncraBot</strong>, votre assistant virtuel intelligent.</p>
          <div class="quick-actions">
            <button class="quick-btn" (click)="sendQuickMessage('bonjour')">
              👋 Dire bonjour
            </button>
            <button class="quick-btn" (click)="sendQuickMessage('je cherche un iphone')">
              📱 Chercher iPhone
            </button>
            <button class="quick-btn" (click)="sendQuickMessage('aide')">
              ❓ Voir l'aide
            </button>
          </div>
        </div>

        <div class="message-list">
          <div *ngFor="let message of messages" 
               class="message-wrapper"
               [class.user-message]="message.isUser"
               [class.bot-message]="!message.isUser">
            
            <!-- Avatar -->
            <div class="message-avatar">
              <span *ngIf="message.isUser">👤</span>
              <span *ngIf="!message.isUser">🤖</span>
            </div>

            <!-- Message Content -->
            <div class="message-content">
              <!-- Bubble -->
              <div class="message-bubble" [class.typing]="message.isTyping">
                <span *ngIf="message.isTyping" class="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
                <div *ngIf="!message.isTyping" class="message-text" [innerHTML]="formatMessage(message.text)"></div>
              </div>

              <!-- Metadata (only for bot messages) -->
              <div class="message-meta" *ngIf="!message.isUser && message.intent">
                <div class="intent-badge" [class]="'intent-' + getIntentClass(message.intent)">
                  <span class="intent-icon">{{ getIntentIcon(message.intent) }}</span>
                  {{ message.intent }}
                </div>
                <div class="confidence-badge" [class.high]="(message.confidence || 0) > 0.8" [class.medium]="(message.confidence || 0) > 0.5 && (message.confidence || 0) <= 0.8" [class.low]="(message.confidence || 0) <= 0.5">
                  {{ ((message.confidence || 0) * 100).toFixed(0) }}%
                </div>
                <div class="sentiment-badge" [class.positive]="(message.sentimentScore || 0) > 0.3" [class.negative]="(message.sentimentScore || 0) < -0.3" [class.neutral]="(message.sentimentScore || 0) >= -0.3 && (message.sentimentScore || 0) <= 0.3" *ngIf="message.sentimentScore !== undefined && message.sentimentScore !== 0">
                  {{ message.sentimentScore > 0.3 ? '😊' : message.sentimentScore < -0.3 ? '😞' : '😐' }}
                </div>
              </div>

              <!-- Entities (only for bot messages) -->
              <div class="entities-tags" *ngIf="!message.isUser && message.entities && getEntityKeys(message.entities).length > 0">
                <span class="entity-tag" *ngFor="let key of getEntityKeys(message.entities)">
                  <span class="entity-key">{{ key }}:</span>
                  <span class="entity-value">{{ message.entities![key] }}</span>
                </span>
              </div>

              <!-- Suggestions -->
              <div class="suggestions" *ngIf="!message.isUser && message.suggestions && message.suggestions.length > 0">
                <button class="suggestion-btn" 
                        *ngFor="let suggestion of message.suggestions"
                        (click)="sendQuickMessage(suggestion)">
                  {{ suggestion }}
                </button>
              </div>

              <!-- Timestamp -->
              <div class="timestamp">
                {{ message.timestamp | date:'HH:mm' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection Status - affiché seulement après vérification et si déconnecté -->
      <div class="connection-status" *ngIf="backendChecked && !backendConnected">
        <span class="status-warning">⚠️ Backend non connecté (port 8086)</span>
        <button class="btn-retry" (click)="checkBackendConnection()">Vérifier</button>
      </div>
      
      <!-- Loading indicator pendant la vérification -->
      <div class="connection-status checking" *ngIf="!backendChecked">
        <span class="status-checking">🔄 Vérification de la connexion...</span>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <div class="input-wrapper">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            (keydown.enter)="onEnterPress($event)"
            placeholder="Écrivez votre message... (ex: 'bonjour', 'prix iphone 21')"
            [disabled]="isLoading"
            class="message-input"
            #messageInput
          />
          
          <!-- Bouton Annuler quand loading -->
          <button 
            *ngIf="isLoading"
            class="cancel-btn" 
            (click)="cancelRequest()"
            title="Annuler la requête"
          >
            ✕
          </button>
          
          <button 
            *ngIf="!isLoading"
            class="send-btn" 
            (click)="sendMessage()" 
            [disabled]="!newMessage.trim()"
          >
            📤
          </button>
        </div>
        <div class="input-hints">
          <span>Essayez:</span>
          <button class="hint-btn" (click)="sendQuickMessage('prix 21')">prix 21</button>
          <button class="hint-btn" (click)="sendQuickMessage('stock 21')">stock 21</button>
          <button class="hint-btn" (click)="sendQuickMessage('commande 100')">commande 100</button>
          <button class="hint-btn" (click)="sendQuickMessage('code promo')">code promo</button>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="footer-stats" *ngIf="messages.length > 0">
        <div class="stat-item">
          <span class="stat-value">{{ messages.length }}</span>
          <span class="stat-label">messages</span>
        </div>
        <div class="stat-item" *ngIf="avgConfidence > 0">
          <span class="stat-value">{{ avgConfidence.toFixed(0) }}%</span>
          <span class="stat-label">confiance moy.</span>
        </div>
        <div class="stat-item" *ngIf="avgProcessingTime > 0">
          <span class="stat-value">{{ avgProcessingTime.toFixed(0) }}ms</span>
          <span class="stat-label">temps moy.</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .chatbot-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-height: 800px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* Header */
    .chatbot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .bot-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bot-avatar {
      font-size: 2.5rem;
      position: relative;
    }

    .status-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-dot.online {
      background: #48bb78;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .bot-details h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #2d3748;
      font-weight: 700;
    }

    .bot-status {
      font-size: 0.8rem;
      color: #48bb78;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .btn-force-refresh {
      background: #10b981;
      color: white;
      animation: pulse-green 2s infinite;
    }

    .btn-force-refresh:hover {
      background: #059669;
    }

    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
    }

    /* NLP Info Panel */
    .nlp-info-panel {
      background: rgba(255, 255, 255, 0.98);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 16px 20px;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .info-header h4 {
      margin: 0;
      color: #667eea;
      font-size: 1rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #718096;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item {
      display: flex;
      gap: 8px;
      font-size: 0.9rem;
    }

    .info-label {
      color: #718096;
      font-weight: 600;
    }

    .info-value {
      color: #2d3748;
    }

    /* Messages Area */
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f7fafc;
    }

    .welcome-message {
      text-align: center;
      padding: 40px 20px;
    }

    .welcome-icon {
      font-size: 4rem;
      margin-bottom: 16px;
    }

    .welcome-message h3 {
      color: #2d3748;
      margin-bottom: 8px;
    }

    .welcome-message p {
      color: #718096;
      margin-bottom: 24px;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .quick-btn {
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      padding: 10px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .quick-btn:hover {
      background: #667eea;
      color: white;
    }

    /* Message List */
    .message-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-wrapper {
      display: flex;
      gap: 12px;
      max-width: 85%;
    }

    .message-wrapper.user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-wrapper.bot-message {
      align-self: flex-start;
    }

    .message-avatar {
      font-size: 1.8rem;
      flex-shrink: 0;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 100%;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .user-message .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bot-message .message-bubble {
      background: white;
      color: #2d3748;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .message-bubble.typing {
      padding: 16px 20px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }

    /* Message Metadata */
    .message-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .intent-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .intent-icon {
      font-size: 0.9rem;
    }

    .intent-greeting { background: #c6f6d5; color: #22543d; }
    .intent-search { background: #bee3f8; color: #2c5282; }
    .intent-price { background: #feebc8; color: #c05621; }
    .intent-track { background: #e9d8fd; color: #553c9a; }
    .intent-complaint { background: #fed7d7; color: #c53030; }
    .intent-promo { background: #fef5e7; color: #b7791f; }
    .intent-default { background: #e2e8f0; color: #4a5568; }

    .confidence-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .confidence-badge.high { background: #c6f6d5; color: #22543d; }
    .confidence-badge.medium { background: #feebc8; color: #c05621; }
    .confidence-badge.low { background: #fed7d7; color: #c53030; }

    .sentiment-badge {
      font-size: 0.9rem;
    }

    /* Entities */
    .entities-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .entity-tag {
      background: #edf2f7;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .entity-key {
      color: #718096;
      font-weight: 600;
    }

    .entity-value {
      color: #2d3748;
      font-weight: 700;
      margin-left: 4px;
    }

    /* Suggestions */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .suggestion-btn {
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      color: #667eea;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-btn:hover {
      background: #667eea;
      color: white;
    }

    /* Timestamp */
    .timestamp {
      font-size: 0.7rem;
      color: #a0aec0;
      align-self: flex-start;
    }

    .user-message .timestamp {
      align-self: flex-end;
    }

    /* Input Area */
    .input-area {
      background: white;
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
    }

    .input-wrapper {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .message-input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 24px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .message-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .message-input:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .send-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-btn.loading {
      background: #a0aec0;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Connection Status */
    .connection-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      margin: 0 16px 8px;
    }

    .connection-status.checking {
      background: #dbeafe;
      border-color: #3b82f6;
      justify-content: center;
    }

    .status-warning {
      font-size: 0.85rem;
      color: #92400e;
      font-weight: 500;
    }

    .status-checking {
      font-size: 0.85rem;
      color: #1e40af;
      font-weight: 500;
    }

    .btn-retry {
      background: #f59e0b;
      border: none;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      color: white;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-retry:hover {
      background: #d97706;
    }

    /* Cancel Button */
    .cancel-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: #ef4444;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      animation: pulse-red 1.5s infinite;
    }

    @keyframes pulse-red {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    }

    .cancel-btn:hover {
      background: #dc2626;
      animation: none;
    }

    /* Input Hints */
    .input-hints {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .input-hints span {
      font-size: 0.8rem;
      color: #718096;
    }

    .hint-btn {
      background: #edf2f7;
      border: none;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
    }

    .hint-btn:hover {
      background: #e2e8f0;
    }

    /* Footer Stats */
    .footer-stats {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 12px;
      background: #f7fafc;
      border-top: 1px solid #e2e8f0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.7rem;
      color: #718096;
      text-transform: uppercase;
    }

    /* Scrollbar */
    .messages-area::-webkit-scrollbar {
      width: 6px;
    }

    .messages-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages-area::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .chatbot-container {
        border-radius: 0;
        max-height: 100vh;
      }

      .message-wrapper {
        max-width: 90%;
      }
    }
  `]
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  private apiUrl = 'http://localhost:8086/ms6/api/chatbot';
  private destroy$ = new Subject<void>();
  private abortController$ = new Subject<void>(); // Pour annuler les requêtes

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  showNLPInfo = false;
  backendConnected = true; // Par défaut true pour ne pas afficher l'erreur au démarrage
  backendChecked = false; // Pour savoir si on a déjà vérifié
  private messageIdCounter = 0;

  // Statistics
  avgConfidence = 0;
  avgProcessingTime = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Vérifier la connexion au backend
    this.checkBackendConnection();
    
    // Welcome message after short delay
    setTimeout(() => {
      this.addBotMessage({
        response: "Bonjour ! Je suis **SyncraBot**, votre assistant virtuel.\n\nJe peux vous aider à:\n- Rechercher des produits\n- Vérifier les prix\n- Suivre vos commandes\n- Obtenir des recommandations\n\nComment puis-je vous aider aujourd'hui ?",
        intent: 'GREETING',
        confidence: 0.95,
        sentimentScore: 0,
        suggestions: ['Chercher un produit', 'Voir mes commandes', 'Code promo', 'Aide'],
        entities: {}
      });
    }, 500);
  }

  /**
   * Vérifier si le backend est accessible
   */
  checkBackendConnection(): void {
    this.http.get(`${this.apiUrl}/health`)
      .pipe(
        timeout(3000),
        catchError(() => of(null))
      )
      .subscribe({
        next: (response) => {
          this.backendChecked = true;
          this.backendConnected = response !== null;
          console.log('Backend connecté:', this.backendConnected, response);
          this.cdr.detectChanges(); // Forcer la mise à jour de l'UI
        },
        error: () => {
          this.backendChecked = true;
          this.backendConnected = false;
          console.warn('Backend non accessible');
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Forcer l'annulation d'une requête en cours
   */
  cancelRequest(): void {
    this.abortController$.next();
    this.isLoading = false;
    
    // Retirer l'indicateur de frappe
    this.messages = this.messages.filter(m => !m.isTyping);
    
    this.addBotMessage({
      response: "Requête annulée. Vous pouvez réessayer.",
      intent: 'ERROR',
      confidence: 0,
      sentimentScore: 0,
      entities: {},
      suggestions: ['Réessayer', 'Vérifier connexion']
    });
    
    this.focusInput();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.abortController$.next();
    this.abortController$.complete();
  }

  /**
   * Gérer la touche Entrée avec vérification
   */
  onEnterPress(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isLoading && this.newMessage.trim()) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || this.isLoading) {
      console.log('Message bloqué: text=', text, 'isLoading=', this.isLoading);
      return;
    }

    console.log('Envoi message:', text);

    // Add user message
    const userMsg: ChatMessage = {
      id: ++this.messageIdCounter,
      text: text,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.newMessage = '';
    this.cdr.detectChanges(); // Forcer l'affichage immédiat
    this.scrollToBottom();

    // Add typing indicator
    const typingMsg: ChatMessage = {
      id: ++this.messageIdCounter,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMsg);
    this.isLoading = true;
    this.cdr.detectChanges(); // Forcer l'affichage du typing
    this.scrollToBottom();

    // Reset abort controller pour cette requête
    this.abortController$ = new Subject<void>();
    
    // DÉLAI DE 4 SECONDES pour simuler le temps de réflexion du bot
    const thinkingDelay = 4000;
    
    // Sécurité: Forcer le reset de isLoading après 15 secondes maximum
    const safetyTimeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Safety timeout triggered - forcing isLoading to false');
        this.isLoading = false;
        this.messages = this.messages.filter(m => m.id !== typingMsg.id);
        this.addBotMessage({
          response: "La requête a pris trop de temps. Le serveur ne répond pas.",
          intent: 'ERROR',
          confidence: 0,
          sentimentScore: 0,
          entities: {},
          suggestions: ['Réessayer', 'Vérifier connexion']
        });
        this.focusInput();
      }
    }, 15000 + thinkingDelay);
    
    // Attendre 4 secondes avant d'envoyer la requête au backend
    setTimeout(() => {
      if (!this.isLoading) {
        // L'utilisateur a annulé pendant l'attente
        return;
      }
      
      // Call API avec timeout de 10 secondes
    this.http.post<ChatbotResponse>(`${this.apiUrl}/message`, {
      message: text,
      userId: 1
    })
    .pipe(
      timeout(10000), // Timeout après 10 secondes
      catchError(error => {
        console.error('Erreur HTTP ou timeout:', error);
        // Forcer isLoading à false en cas d'erreur
        this.isLoading = false;
        return of({
          response: "Le serveur met trop de temps à répondre. Vérifiez que Spring Boot est démarré sur le port 8086.",
          intent: 'ERROR',
          confidence: 0,
          sentimentScore: 0,
          entities: {},
          suggestions: ['Réessayer', 'Vérifier connexion']
        } as ChatbotResponse);
      }),
      takeUntil(this.abortController$),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response) => {
        clearTimeout(safetyTimeout); // Annuler le safety timeout
        console.log('Réponse reçue:', response);
        
        // Remove typing indicator
        this.messages = this.messages.filter(m => m.id !== typingMsg.id);
        this.cdr.detectChanges(); // Forcer la mise à jour
        
        // Add bot response
        this.addBotMessage(response);
        
        // Update stats
        this.updateStats(response);
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Forcer la mise à jour finale
        this.scrollToBottom();
        this.focusInput(); // Remettre le focus sur l'input
      },
      error: (error) => {
        clearTimeout(safetyTimeout); // Annuler le safety timeout
        console.error('Erreur subscribe:', error);
        
        // Remove typing indicator
        this.messages = this.messages.filter(m => m.id !== typingMsg.id);
        this.cdr.detectChanges();
        
        // Add error message
        this.addBotMessage({
          response: "❌ Erreur de connexion. Vérifiez que le backend Spring Boot est démarré (port 8086).",
          intent: 'ERROR',
          confidence: 0,
          sentimentScore: 0,
          entities: {},
          suggestions: ['Réessayer', 'Vérifier connexion']
        });
        
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
        this.focusInput();
      }
    });
    
    }, thinkingDelay); // ⏱️ Fin du délai de 4 secondes
  }

  sendQuickMessage(text: string): void {
    this.newMessage = text;
    this.sendMessage();
    this.focusInput();
  }

  clearChat(): void {
    this.messages = [];
    this.avgConfidence = 0;
    this.avgProcessingTime = 0;
    
    // Add welcome message again
    setTimeout(() => {
      this.addBotMessage({
        response: "👋 Conversation effacée ! Comment puis-je vous aider ?",
        intent: 'GREETING',
        confidence: 0.95,
        sentimentScore: 0,
        suggestions: ['Chercher un produit', 'Voir mes commandes', 'Aide'],
        entities: {}
      });
    }, 200);
  }

  toggleNLPInfo(): void {
    this.showNLPInfo = !this.showNLPInfo;
  }

  /**
   * Force l'affichage des résultats - utile si le chatbot reste bloqué sur "thinking"
   * Ce bouton permet de débloquer l'affichage quand Angular ne détecte pas les changements
   */
  forceDisplayResults(): void {
    console.log('🔄 Forçage de l\'affichage des résultats...');
    
    // 1. Retirer tous les indicateurs "typing"
    const hadTyping = this.messages.some(m => m.isTyping);
    this.messages = this.messages.filter(m => !m.isTyping);
    
    // 2. Forcer isLoading à false
    this.isLoading = false;
    
    // 3. Vérifier s'il y a des réponses en attente dans le dernier message
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.isUser && hadTyping) {
      // Le dernier message est de l'utilisateur et on avait un typing, 
      // donc la réponse a probablement été perdue
      this.addBotMessage({
        response: "⚠️ La réponse peut avoir été perdue. Veuillez réessayer votre question.",
        intent: 'ERROR',
        confidence: 0,
        sentimentScore: 0,
        entities: {},
        suggestions: ['Réessayer', 'Aide']
      });
    }
    
    // 4. Forcer la détection de changement Angular
    this.cdr.detectChanges();
    this.scrollToBottom();
    this.focusInput();
    
    // 5. Vérifier à nouveau la connexion backend
    this.checkBackendConnection();
    
    console.log('✅ Forçage terminé. Messages actuels:', this.messages.length);
  }

  private addBotMessage(response: Partial<ChatbotResponse>): void {
    const botMsg: ChatMessage = {
      id: ++this.messageIdCounter,
      text: response.response || '',
      isUser: false,
      timestamp: new Date(),
      intent: response.intent,
      confidence: response.confidence,
      sentimentScore: response.sentimentScore,
      entities: response.entities,
      suggestions: response.suggestions
    };
    this.messages.push(botMsg);
  }

  private updateStats(response: ChatbotResponse): void {
    const botMessages = this.messages.filter(m => !m.isUser && m.confidence !== undefined);
    
    if (botMessages.length > 0) {
      this.avgConfidence = botMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) 
        / botMessages.length * 100;
    }
    
    if (response.processingTimeMs) {
      const times = this.messages
        .filter(m => !m.isUser && m.timestamp)
        .length;
      // Simplified - in real app, track actual processing times
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  formatMessage(text: string): string {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getIntentClass(intent: string): string {
    const intentMap: { [key: string]: string } = {
      'GREETING': 'greeting',
      'SEARCH_PRODUCT': 'search',
      'CHECK_PRICE': 'price',
      'TRACK_ORDER': 'track',
      'CHECK_STOCK': 'search',
      'COMPLAINT': 'complaint',
      'APPLY_PROMO': 'promo',
      'GET_RECOMMENDATION': 'search',
      'THANKS': 'greeting',
      'HELP': 'search'
    };
    return intentMap[intent] || 'default';
  }

  getIntentIcon(intent: string): string {
    const iconMap: { [key: string]: string } = {
      'GREETING': '👋',
      'SEARCH_PRODUCT': '🔍',
      'CHECK_PRICE': '💰',
      'TRACK_ORDER': '📦',
      'CHECK_STOCK': '📊',
      'COMPLAINT': '🆘',
      'APPLY_PROMO': '🎟️',
      'GET_RECOMMENDATION': '🎯',
      'THANKS': '😊',
      'HELP': '❓'
    };
    return iconMap[intent] || '🤖';
  }

  getEntityKeys(entities: { [key: string]: string } | undefined): string[] {
    return entities ? Object.keys(entities) : [];
  }
}
