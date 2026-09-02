import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global/global.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  private globalService = inject(GlobalService);
  
  private app?: FirebaseApp;
  private messaging?: Messaging;
  private initialized = false;

  constructor() {}

  async init() {
    if (this.initialized) return;
    try {
      if (environment.firebaseConfig && environment.firebaseConfig.apiKey && environment.firebaseConfig.apiKey !== 'YOUR_API_KEY') {
        this.app = initializeApp(environment.firebaseConfig);
        this.messaging = getMessaging(this.app);
        this.initialized = true;
        this.requestPermission();
        this.listenForMessages();
      } else {
        console.log('[PushNotificationService] Notificações Push Firebase desativadas em ambiente local (utilizando credenciais placeholder).');
      }
    } catch (e) {
      console.error('Error initializing PushNotificationService:', e);
    }
  }

  private async requestPermission() {
    if (!this.messaging) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');

        let registration: ServiceWorkerRegistration | undefined;
        if ('serviceWorker' in navigator && environment.firebaseConfig && environment.firebaseConfig.apiKey !== 'YOUR_API_KEY') {
          const configParams = new URLSearchParams({
            apiKey: environment.firebaseConfig.apiKey,
            authDomain: environment.firebaseConfig.authDomain,
            projectId: environment.firebaseConfig.projectId,
            storageBucket: environment.firebaseConfig.storageBucket,
            messagingSenderId: environment.firebaseConfig.messagingSenderId,
            appId: environment.firebaseConfig.appId
          }).toString();
          
          registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${configParams}`);
        }

        const tokenOptions: any = { vapidKey: environment.vapidKey };
        if (registration) {
          tokenOptions.serviceWorkerRegistration = registration;
        }

        const currentToken = await getToken(this.messaging, tokenOptions);
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          this.sendTokenToBackend(currentToken);
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  }

  private listenForMessages() {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload: any) => {
      console.log('Message received. ', payload);
      const title = payload.notification?.title || 'Notificação';
      const body = payload.notification?.body || '';
      // Display local toast
      this.globalService.showToast(`${title}: ${body}`, 'primary', 'notifications-outline');
    });
  }

  private sendTokenToBackend(token: string) {
    this.http.put(`${environment.serverUrl}users/update/fcm-token`, { fcm_token: token }).subscribe({
      next: () => console.log('Token successfully synced with backend'),
      error: (err) => console.error('Error syncing FCM token with backend', err)
    });
  }
}
