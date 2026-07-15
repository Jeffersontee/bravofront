export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    refreshToken: string;
    user: any; // Dados brutos da API
    email_changed?: boolean;
  };
}