export type OAuthProvider = 'google' | 'facebook' | 'apple' | 'github' | 'microsoft';

export interface IOAuthProvider {
  name: OAuthProvider;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes: ('email' | 'profile' | 'openid' | 'public_profile' | 'user:email')[];
  is_active: boolean;

  authorization_url?: string;
  token_url?: string;
  user_info_url?: string;

  createdAt: Date;
  updatedAt: Date;
}
