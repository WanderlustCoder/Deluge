// In-memory token store for password reset
// In production, these would be stored in the database

interface TokenData {
  userId: string;
  expiresAt: Date;
}

const resetTokens = new Map<string, TokenData>();

export function setResetToken(hashedToken: string, data: TokenData) {
  resetTokens.set(hashedToken, data);
}

export function getResetToken(hashedToken: string): TokenData | undefined {
  return resetTokens.get(hashedToken);
}

export function deleteResetToken(hashedToken: string) {
  resetTokens.delete(hashedToken);
}

export function cleanupExpiredTokens() {
  const now = new Date();
  for (const [key, value] of resetTokens.entries()) {
    if (value.expiresAt < now) {
      resetTokens.delete(key);
    }
  }
}
