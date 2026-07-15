import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  deliveryRadiusKm: 120,
  serverUrl: 'https://adega-hub-staging-app-b43f425ba856.herokuapp.com/api/', // URL da API de Homologação
  imageUrl: 'https://adega-hub-staging-app-b43f425ba856.herokuapp.com/uploads/', // URL de Uploads de Homologação
  googleMapsApiKey: 'AIzaSyAFe1BrhL_Wi4S28qkEz2X55ByJZOoVobo',
  firebaseAPIKey: 'CHAVE_FIREBASE_HOMOLOG',
  razorpay: {
    key_id: 'homolog_key_id',
    key_secret: 'homolog_secret'
  },
  stripe: {
    publishableKey: 'pk_test_51TEhuWD35fDvfYWqGz41phFty8k1LYbQUau6zrazrbWU2a3D7nrvnE0xjOlsN2NfkGkWdxSXz74a4RqBmspn8CuV00L3a2ADNn'
  },
  mercadoPago: {
    public_key: 'TEST-4e059d90-d653-43d3-8382-8425a9d39e5e',
    accessToken: 'TEST-8284964456931465-040923-6999a8c3c8e79a7142d9ea3a07076339-3158709223',
  },
};