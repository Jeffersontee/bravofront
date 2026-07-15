import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  deliveryRadiusKm: 120,
  serverUrl: 'https://hub-production-app-6b0cc4b85f62.herokuapp.com/api/', // URL da API de Produção
  imageUrl: 'https://hub-production-app-6b0cc4b85f62.herokuapp.com/uploads/', // URL de Uploads de Produção
  googleMapsApiKey: 'AIzaSyAFe1BrhL_Wi4S28qkEz2X55ByJZOoVobo',
  firebaseAPIKey: 'AIzaSyB2izmqvdJHMQB4L9Fg9WpfHwMQDe4G_uA',
  razorpay: {
    key_id: 'your_key_id',
    key_secret: 'your_secret'
  },
  stripe: {
    publishableKey: 'pk_test_51TEhuWD35fDvfYWqGz41phFty8k1LYbQUau6zrazrbWU2a3D7nrvnE0xjOlsN2NfkGkWdxSXz74a4RqBmspn8CuV00L3a2ADNn'
  },
  mercadoPago: {
    public_key: 'TEST-4e059d90-d653-43d3-8382-8425a9d39e5e',
    accessToken: 'TEST-8284964456931465-040923-6999a8c3c8e79a7142d9ea3a07076339-3158709223',
  },
};
