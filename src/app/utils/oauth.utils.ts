/**
 * Frontend-safe OAuth utilities.
 *
 * This project’s OAuth token encryption and expired-token cleanup are backend responsibilities
 * (previously implemented with Node.js `crypto` + `mongoose`).
 *
 * The frontend should treat API responses as already decrypted/plain strings.
 * To keep TypeScript and runtime safe in the browser, we provide identity implementations.
 */

export const encryptToken = (token: string | null): string | null => token;

export const decryptToken = (encryptedData: string | null): string | null => encryptedData;

export interface OAuthTokenModelLike {
  updateMany: (
    filter: {
      expires_at: { $lt: Date };
      is_active: boolean;
    },
    update: {
      $set: {
        is_active: boolean;
        updated_at: Date;
      };
    }
  ) => Promise<{
    modifiedCount?: number;
    matchedCount?: number;
  }>;
}

/**
 * Job para limpar tokens expirados no banco de dados (backend only).
 * In frontend, this is intentionally unsupported.
 */
export const cleanupExpiredTokens = async (
  _OAuthTokenModel: OAuthTokenModelLike
): Promise<{ modifiedCount?: number; matchedCount?: number }> => {
  throw new Error('cleanupExpiredTokens is not supported in the frontend. Call the backend job instead.');
};
