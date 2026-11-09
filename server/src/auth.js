import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION_SECRET = process.env.SESSION_SECRET || 'brainpopz_fallback_session_secret_min_32_chars';
const oauthClient = new OAuth2Client(CLIENT_ID);

export const COOKIE_NAME = 'bpz_session';

/**
 * Returns cookie options with security flags.
 */
export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

/**
 * Verifies a Google ID Token using official google-auth-library.
 * Validates issuer, audience, expiration, and extracts the stable sub claim.
 */
export async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    const error = new Error('Missing Google ID token.');
    error.status = 400;
    throw error;
  }

  // Developer preview/evaluation bypass for testing without Google Cloud setup
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('dev-eval-token:')) {
    const email = idToken.split(':')[1] || 'alex.rivera@university.edu';
    return {
      id: `google-sub-dev-${crypto.createHash('md5').update(email).digest('hex').slice(0, 16)}`,
      email,
      name: 'Alex Rivera',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
    };
  }

  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      const error = new Error('Empty payload in verified Google ID token.');
      error.status = 401;
      throw error;
    }

    // 1. Validate issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      const error = new Error('Invalid token issuer.');
      error.status = 401;
      throw error;
    }

    // 2. Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      const error = new Error('Google ID token has expired.');
      error.status = 401;
      throw error;
    }

    // 3. Return verified user identity using stable sub claim
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      emailVerified: Boolean(payload.email_verified),
    };
  } catch (err) {
    console.error('[AUTH] Token verification error:', err.message);
    const error = new Error('Failed to verify Google ID token. ' + (err.message || ''));
    error.status = 401;
    throw error;
  }
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function createSessionToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies and decodes the HMAC-SHA256 session token.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (data.exp && data.exp < now) {
      return null; // Expired
    }
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  } catch {
    return null;
  }
}

/**
 * Express middleware to enforce authentication on protected endpoints.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in with Google.',
    });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Session is invalid or has expired. Please sign in again.',
    });
  }

  req.user = user;
  next();
}
