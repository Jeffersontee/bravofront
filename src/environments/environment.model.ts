export interface Environment {
  production: boolean;
  deliveryRadiusKm: number;
  serverUrl: string;
  imageUrl: string;
  googleMapsApiKey: string;
  firebaseAPIKey: string;
  razorpay: {
    key_id: string;
    key_secret: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
  };
  mercadoPago: {
    public_key: string;
    accessToken: string;
  };
}