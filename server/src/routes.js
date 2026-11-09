import { Router } from 'express';
import { GenerateRequestSchema } from './validators.js';
import { generateStudyAsset } from './gemini.js';
import {
  verifyGoogleIdToken,
  createSessionToken,
  verifySessionToken,
  requireAuth,
  COOKIE_NAME,
  getCookieOptions,
} from './auth.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BrainPopZ AI Generation Engine',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID),
  });
});

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// POST /api/auth/google - Authenticate with verified Google ID token
apiRouter.post('/auth/google', async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing Google ID token credential in request body.',
    });
  }

  try {
    const verifiedUser = await verifyGoogleIdToken(credential);
    const sessionToken = createSessionToken(verifiedUser);

    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: verifiedUser,
    });
  } catch (err) {
    console.error('[AUTH] Google auth failed:', err.message);
    const safeMessage = (err.message || 'Authentication failed').replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
    return res.status(err.status || 401).json({
      error: 'Authentication Failed',
      message: safeMessage,
    });
  }
});

// GET /api/auth/me - Restore active user session from HTTP-only cookie
apiRouter.get('/auth/me', (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message: 'No active session found.',
    });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({
      authenticated: false,
      message: 'Session token has expired or is invalid.',
    });
  }

  return res.status(200).json({
    authenticated: true,
    user,
  });
});

// POST /api/auth/logout - Clear session cookie
apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// -------------------------------------------------------------
// Protected AI Generation Endpoint
// -------------------------------------------------------------
apiRouter.post('/generate', requireAuth, async (req, res) => {
  // 1. Validate incoming request parameters with Zod
  const validation = GenerateRequestSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request parameters',
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { notes, mode, difficulty, quantity } = validation.data;

  try {
    console.log(`[AI-GEN] Generating ${quantity} ${mode} (level: ${difficulty})...`);
    const startTime = Date.now();

    const result = await generateStudyAsset({
      notes,
      mode,
      difficulty,
      quantity,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[AI-GEN] Success! Generated "${result.title}" in ${elapsed}ms via ${result.modelUsed}.`);

    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        mode,
        difficulty,
        count: mode === 'flashcards' ? result.cards.length : result.questions.length,
        durationMs: elapsed,
      },
    });
  } catch (err) {
    console.error('[AI-GEN] Error during generation:', err.message);

    // Classify known error patterns
    const rawMessage = err.message || '';
    const message = rawMessage.replace(/key=[^&\s]+/gi, 'key=[REDACTED]');

    if (message.includes('API key') || message.includes('API_KEY') || err.status === 401 || err.status === 403) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid or missing Google Gemini API key. Please check the server configuration.',
      });
    }

    if (message.includes('429') || message.includes('quota') || message.includes('ResourceExhausted') || err.status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Google Gemini API rate limit exceeded. Please wait a moment before trying again.',
      });
    }

    if (message.includes('timeout') || message.includes('timed out') || err.status === 504) {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'The AI request timed out after 25 seconds. Try reducing note length or deck size.',
      });
    }

    if (err.status === 502 || message.includes('validation') || message.includes('JSON')) {
      return res.status(502).json({
        error: 'AI Output Validation Error',
        message: message || 'Gemini output failed structural schema validation.',
      });
    }

    return res.status(err.status || 500).json({
      error: 'Generation Failed',
      message: message || 'An unexpected error occurred while communicating with Google Gemini.',
    });
  }
});

