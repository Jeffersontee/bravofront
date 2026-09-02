import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  deliveryRadiusKm: 120,
  serverUrl: 'https://bravo-production-app-94ee98927401.herokuapp.com/api/',
  imageUrl: 'https://bravo-production-app-94ee98927401.herokuapp.com/uploads/',
  googleMapsApiKey: 'AIzaSyAFe1BrhL_Wi4S28qkEz2X55ByJZOoVobo',
  firebaseAPIKey: 'AIzaSyB2izmqvdJHMQB4L9Fg9WpfHwMQDe4G_uA',
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  },
  vapidKey: 'YOUR_VAPID_KEY',
  razorpay: {
    key_id: 'your_key_id'
  },
  stripe: {
    publishableKey: 'pk_test_51TEhuWD35fDvfYWqGz41phFty8k1LYbQUau6zrazrbWU2a3D7nrvnE0xjOlsN2NfkGkWdxSXz74a4RqBmspn8CuV00L3a2ADNn'
  },
  mercadoPago: {
    public_key: 'TEST-4e059d90-d653-43d3-8382-8425a9d39e5e'
  },
};
