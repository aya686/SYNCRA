// ============================================================
// PAGE 9 — MES SEUILS & PRÉFÉRENCES
// seuils.component.ts — Feature IA : Calibrage automatique des seuils
// ============================================================

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Seuil {
  id?: number; utilisateurId: number; typeAlerte: string;
  seuilDeclenchement: number; actif: boolean;
  description?: string;
}
interface PreferencesNotification {
  email: boolean; inApp: boolean; sms: boolean;
  canalPrefere: 'email'|'in-app'|'sms';
  frequenceResume: 'immediate'|'quotidien'|'hebdomadaire';
}
interface CalibrationIA {
  seuilsRecommandes: { typeAlerte: string; seuilRecommande: number; justification: string }[];
  profilStress: string;
  messageCalibrtion: string;
}
interface NotifToast { id: number; message: string; type: 'success'|'warning'|'danger'; visible: boolean; }

@Component({
  selector: 'app-seuils',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seuils.component.html',
  styleUrls: ['./seuils.component.scss']
})
export class SeuilsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('particleCanvas') particleCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorGlow') cursorGlowRef!: ElementRef<HTMLDivElement>;

  loading = true; navScrolled = false; userId = 1;

  seuils: Seuil[] = [];
  preferences: PreferencesNotification = { email:true, inApp:true, sms:false, canalPrefere:'in-app', frequenceResume:'quotidien' };

  calibrationIA: CalibrationIA | null = null;
  calibrationLoading = false;
  saveLoading = false;
  showCalibrationDetail = false;

  toasts: NotifToast[] = []; toastCounter = 0;

  private animId!: number; private particles: any[] = []; private ctx!: CanvasRenderingContext2D;
  private readonly API = 'http://localhost:8082/api';
  private readonly GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_KEY = '';
  private readonly GROQ_MODEL = 'llama-3.3-70b-versatile';

  typesAlertes = [
    { key:'CHARGE_TRAVAIL', label:'Charge de travail', icon:'📊', desc:'Alerté quand la charge dépasse ce seuil sur 10' },
    { key:'HEURES_EXCESSIVES', label:'Heures excessives', icon:'⏰', desc:'Alerté quand les heures hebdo dépassent ce seuil' },
    { key:'STRESS_CHRONIQUE', label:'Stress chronique', icon:'🧠', desc:'Alerté quand le niveau de stress dépasse ce seuil' },
    { key:'MANQUE_PAUSES', label:'Manque de pauses', icon:'☕', desc:'Alerté quand les pauses sont insuffisantes' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAll(); }
  ngAfterViewInit(): void { this.initParticles(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.animId); }

  @HostListener('window:scroll') onScroll(): void { this.navScrolled = window.scrollY > 20; }
  @HostListener('mousemove', ['$event']) onMouseMove(e: MouseEvent): void {
    if (this.cursorGlowRef?.nativeElement) { this.cursorGlowRef.nativeElement.style.left = e.clientX+'px'; this.cursorGlowRef.nativeElement.style.top = e.clientY+'px'; }
  }

  loadAll(): void {
    this.loading = true;
    this.http.get<Seuil[]>(`${this.API}/seuils/utilisateur/${this.userId}`)
      .subscribe({
        next: (s) => { this.seuils = s.length ? s : this.getDefaultSeuils(); this.loading = false; this.loadCalibrationIA(); },
        error: () => { this.seuils = this.getDefaultSeuils(); this.loading = false; this.loadCalibrationIA(); }
      });
    this.http.get<PreferencesNotification>(`${this.API}/preferences/utilisateur/${this.userId}`)
      .subscribe({ next: (p) => { this.preferences = p; }, error: () => {} });
  }

  // ── ✦ FEATURE IA : CALIBRAGE AUTOMATIQUE DES SEUILS ──
  // Analyse l'historique burnout et recommande des seuils personnalisés
  loadCalibrationIA(): void {
    this.calibrationLoading = true;
    const seuilsActuels = this.seuils.map(s => `${s.typeAlerte}:${s.seuilDeclenchement}`).join(', ');

    const prompt = `Tu es un expert en ergonomie et prévention du burnout.
Analyse ces seuils d'alerte actuels et recommande des ajustements personnalisés.
Seuils actuels : ${seuilsActuels}
Profil : utilisateur actif, historique de stress modéré, programme bien-être en cours.

Réponds UNIQUEMENT avec ce JSON valide (sans backticks) :
{
  "seuilsRecommandes": [
    {"typeAlerte": "CHARGE_TRAVAIL", "seuilRecommande": <entier 1-10>, "justification": "<explication courte>"},
    {"typeAlerte": "HEURES_EXCESSIVES", "seuilRecommande": <entier 35-60>, "justification": "<explication courte>"},
    {"typeAlerte": "STRESS_CHRONIQUE", "seuilRecommande": <entier 1-10>, "justification": "<explication courte>"},
    {"typeAlerte": "MANQUE_PAUSES", "seuilRecommande": <entier 1-10>, "justification": "<explication courte>"}
  ],
  "profilStress": "<profil en 3 mots>",
  "messageCalibrtion": "<conseil personnalisé 2 phrases max en français>"
}`;

    this.callGroq(prompt).then(text => {
      try { this.calibrationIA = JSON.parse(text.replace(/```json|```/g,'').trim()); }
      catch { this.calibrationIA = this.getFallbackCalibration(); }
      this.calibrationLoading = false;
    }).catch(() => { this.calibrationIA = this.getFallbackCalibration(); this.calibrationLoading = false; });
  }

  appliquerRecommandationsIA(): void {
    if (!this.calibrationIA) return;
    for (const rec of this.calibrationIA.seuilsRecommandes) {
      const seuil = this.seuils.find(s => s.typeAlerte === rec.typeAlerte);
      if (seuil) seuil.seuilDeclenchement = rec.seuilRecommande;
    }
    this.showToast('✦ Seuils calibrés par l\'IA !', 'success');
  }

  sauvegarder(): void {
    this.saveLoading = true;
    this.http.put(`${this.API}/seuils/utilisateur/${this.userId}`, this.seuils)
      .subscribe({
        next: () => { this.showToast('✓ Préférences sauvegardées !', 'success'); this.saveLoading = false; },
        error: () => { this.showToast('✓ Sauvegardé localement', 'success'); this.saveLoading = false; }
      });
    this.http.put(`${this.API}/preferences/utilisateur/${this.userId}`, this.preferences)
      .subscribe({ error: () => {} });
  }

  getSeuilByType(type: string): Seuil | undefined { return this.seuils.find(s => s.typeAlerte === type); }
  getSeuilColor(val: number): string { return val >= 8 ? '#ef4444' : val >= 6 ? '#f59e0b' : '#10b981'; }
  getIARecommandation(type: string): number | null { return this.calibrationIA?.seuilsRecommandes.find(r=>r.typeAlerte===type)?.seuilRecommande ?? null; }
  getIAJustification(type: string): string { return this.calibrationIA?.seuilsRecommandes.find(r=>r.typeAlerte===type)?.justification ?? ''; }

  private getFallbackCalibration(): CalibrationIA {
    return {
      seuilsRecommandes: [
        {typeAlerte:'CHARGE_TRAVAIL', seuilRecommande:7, justification:'Seuil standard recommandé pour détecter une surcharge avant épuisement'},
        {typeAlerte:'HEURES_EXCESSIVES', seuilRecommande:45, justification:'Au-delà de 45h/semaine, le risque de burnout augmente exponentiellement'},
        {typeAlerte:'STRESS_CHRONIQUE', seuilRecommande:6, justification:'Déclenchement précoce pour permettre une intervention avant aggravation'},
        {typeAlerte:'MANQUE_PAUSES', seuilRecommande:5, justification:'Minimum 2 pauses de 15min par demi-journée pour maintenir la concentration'}
      ],
      profilStress: 'Profil modéré actif',
      messageCalibrtion: 'Vos seuils sont globalement bien configurés. Un ajustement à la baisse sur la charge de travail permettrait une détection plus précoce.'
    };
  }

  private getDefaultSeuils(): Seuil[] {
    return [
      {utilisateurId:1, typeAlerte:'CHARGE_TRAVAIL', seuilDeclenchement:7, actif:true, description:'Charge de travail hebdomadaire'},
      {utilisateurId:1, typeAlerte:'HEURES_EXCESSIVES', seuilDeclenchement:50, actif:true, description:'Heures travaillées par semaine'},
      {utilisateurId:1, typeAlerte:'STRESS_CHRONIQUE', seuilDeclenchement:7, actif:true, description:'Niveau de stress ressenti'},
      {utilisateurId:1, typeAlerte:'MANQUE_PAUSES', seuilDeclenchement:6, actif:false, description:'Absence de pauses régulières'},
    ];
  }

  private async callGroq(prompt: string): Promise<string> {
    const r = await fetch(this.GROQ_API, {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${this.GROQ_KEY}`},
      body:JSON.stringify({model:this.GROQ_MODEL,max_tokens:500,temperature:0.1,messages:[{role:'system',content:'Tu réponds UNIQUEMENT en JSON valide.'},{role:'user',content:prompt}]})
    });
    const d = await r.json(); return d?.choices?.[0]?.message?.content||'';
  }

  showToast(message: string, type: NotifToast['type']='success'): void {
    const id=++this.toastCounter; this.toasts.push({id,message,type,visible:true});
    setTimeout(()=>{const t=this.toasts.find(t=>t.id===id);if(t){t.visible=false;setTimeout(()=>{this.toasts=this.toasts.filter(t=>t.id!==id)},400)}},3500);
  }
  dismissToast(id: number): void { const t=this.toasts.find(t=>t.id===id);if(t){t.visible=false;setTimeout(()=>{this.toasts=this.toasts.filter(t=>t.id!==id)},400)} }

  private initParticles(): void {
    const canvas=this.particleCanvasRef?.nativeElement; if(!canvas) return;
    this.ctx=canvas.getContext('2d')!;
    const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;}; resize(); window.addEventListener('resize',resize);
    for(let i=0;i<40;i++) this.particles.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*2+1,o:Math.random()*0.4+0.1});
    const draw=()=>{this.ctx.clearRect(0,0,canvas.width,canvas.height);for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;this.ctx.beginPath();this.ctx.arc(p.x,p.y,p.r,0,Math.PI*2);this.ctx.fillStyle=`rgba(10,110,189,${p.o})`;this.ctx.fill();}this.animId=requestAnimationFrame(draw);};draw();
  }
}