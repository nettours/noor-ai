// backend/src/lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
  return payload.userId;
}

export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  return payload.userId;
}
