// src/app/modules/shared/components/jitsi-meet/jitsi-meet.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';

@Component({
    selector: 'app-jitsi-meet',
    template: `<div #jitsiContainer class="jitsi-container"></div>`,
    styles: [`.jitsi-container { width: 100%; height: 100%; min-height: 500px; border-radius: 16px; overflow: hidden; }`],
    standalone: false
})
export class JitsiMeetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;
  @Input() roomName: string = '';
  @Input() displayName: string = '';
  @Input() isModerator: boolean = false;
  
  private jitsiApi: any = null;
  
  ngAfterViewInit() {
    this.loadJitsiScript();
  }
  
  private loadJitsiScript() {
    if (document.querySelector('#jitsi-script')) {
      this.initJitsi();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'jitsi-script';
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => this.initJitsi();
    document.head.appendChild(script);
  }
  
  // src/app/modules/shared/components/jitsi-meet/jitsi-meet.component.ts

// src/app/modules/shared/components/jitsi-meet/jitsi-meet.component.ts

private initJitsi() {
  // ✅ Revenir à meet.jit.si avec la bonne configuration
  const domain = 'meet.jit.si';
  
  const options = {
    roomName: `resolvo-${this.roomName}`,
    parentNode: this.jitsiContainer.nativeElement,
    userInfo: { displayName: this.displayName || 'Participant' },
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      prejoinPageEnabled: false,
      enableWelcomePage: false,
      // ✅ CES OPTIONS SONT CRUCIALES
      enableLobby: false,
      disableDeepLinking: true,
      enableNoAudioDetection: false,
      enableNoisyMicDetection: false,
      requireDisplayName: false,
      enableClosePage: false,
      // ✅ PERMETTRE AU PREMIER ARRIVANT D'ÊTRE MODÉRATEUR
      enableModeratorOnFirstJoin: true,
      // ✅ DÉSACTIVER L'AUTHENTIFICATION
      hosts: {
        domain: 'meet.jit.si',
        anonymousdomain: 'meet.jit.si',
        authdomain: 'meet.jit.si'
      },
      toolbarButtons: ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'chat', 'settings']
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_BRAND_WATERMARK: false,
      DEFAULT_BACKGROUND: '#1a1a2e',
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
    }
  };
  
  // @ts-ignore
  this.jitsiApi = new JitsiMeetExternalAPI(domain, options);
  
  // ✅ Écouter l'événement de connexion
  this.jitsiApi.addEventListener('videoConferenceJoined', () => {
    console.log('✅ Rejoint la conférence');
    
    // Si c'est le modérateur, forcer les droits
    if (this.isModerator) {
      setTimeout(() => {
        this.jitsiApi.executeCommand('toggleLobby', false);
      }, 1000);
    }
  });
}
  
  public hangup() {
    this.jitsiApi?.executeCommand('hangup');
  }
  
  ngOnDestroy() {
    this.jitsiApi?.dispose();
  }
}