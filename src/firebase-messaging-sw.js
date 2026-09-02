importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Extrai as configurações passadas dinamicamente via query params a partir do environment.ts
const params = new URLSearchParams(location.search);
const apiKey = params.get('apiKey');

if (apiKey && apiKey !== 'YOUR_API_KEY') {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: params.get('authDomain') || '',
    projectId: params.get('projectId') || '',
    storageBucket: params.get('storageBucket') || '',
    messagingSenderId: params.get('messagingSenderId') || '',
    appId: params.get('appId') || ''
  };

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw] Mensagem em segundo plano recebida:', payload);

      const notificationTitle = payload.notification?.title || 'Nova Notificação';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/assets/icon/favicon.png'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.error('[firebase-messaging-sw] Erro ao inicializar Firebase no Service Worker:', err);
  }
} else {
  console.log('[firebase-messaging-sw] Service Worker ativo. Aguardando credenciais válidas do Firebase no environment.');
}
