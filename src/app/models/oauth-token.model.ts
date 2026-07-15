import { decryptToken, encryptToken } from '../utils/oauth.utils';

export type OAuthProvider = 'google' | 'facebook' | 'apple' | 'github' | 'microsoft';

export interface IOAuthToken {
  user_id: string; // ObjectId serialized as string across API boundaries
  provider: OAuthProvider;
  provider_user_id: string;

  // Note: in the backend these may be encrypted-at-rest using mongoose getters/setters.
  // In the frontend we treat them as plain strings coming from the API.
  access_token: string;
  refresh_token?: string;

  token_type: string; // e.g. "Bearer"
  expires_at: Date;

  scope?: string;
  id_token?: string;

  is_active: boolean;
  last_used_at?: Date;

  createdAt: Date;
  updatedAt: Date;

  isExpired(): boolean;
  refresh(): Promise<IOAuthToken>;
}

/**
 * Helper utilities to work with encrypted tokens if the backend returns encrypted-at-rest values.
 * Prefer sending decrypted tokens from the API for frontend usage.
 */
export const oauthTokenEncryption = {
  encrypt: (token: string | null): string | null => encryptToken(token),
  decrypt: (encrypted: string | null): string | null => decryptToken(encrypted),
};
