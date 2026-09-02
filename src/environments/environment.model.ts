export interface Environment {
  production: boolean;
  deliveryRadiusKm: number;
  serverUrl: string;
  imageUrl: string;
  googleMapsApiKey: string;
  firebaseAPIKey: string;
  razorpay: {
    key_id: string;
  };
  stripe: {
    publishableKey: string;
  };
  mercadoPago: {
    public_key: string;
  };
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  vapidKey: string;
}