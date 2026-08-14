importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuração do Firebase
// NOTA: Estes valores devem ser substituídos pelas suas credenciais de produção
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification?.title || 'Nova Notificação';
        const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/assets/icon/favicon.png',
            data: payload.data,
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.error('Firebase SW Error: Configuração pendente ou inválida', error);
}
