import { Router } from 'express';
import multer from 'multer';
import { GenerateRequestSchema } from './validators.js';
import { generateStudyAsset } from './gemini.js';
import { getYouTubeTranscript } from './youtube.js';
import { extractTextFromPdf } from './pdf.js';
import {
  verifyGoogleIdToken,
  createSessionToken,
  verifySessionToken,
  requireAuth,
  COOKIE_NAME,
  getCookieOptions,
} from './auth.js';

export const apiRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents (.pdf) are supported.'));
    }
  },
});

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
// YouTube Transcript Extraction Endpoint
// -------------------------------------------------------------
apiRouter.post('/youtube-transcript', requireAuth, async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Please provide a valid YouTube video URL or ID.',
    });
  }

  try {
    const data = await getYouTubeTranscript(url.trim());
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('[YOUTUBE] Transcript extraction failed:', err.message);
    return res.status(err.status || 500).json({
      error: 'Transcript Extraction Failed',
      message: err.message || 'Unable to fetch transcript from YouTube.',
    });
  }
});

// -------------------------------------------------------------
// PDF Lecture Slide & Document Extraction Endpoint
// -------------------------------------------------------------
apiRouter.post('/extract-pdf', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File Too Large',
          message: 'The uploaded PDF exceeds the 15MB limit. Please upload a smaller document.',
        });
      }
      return res.status(400).json({ error: 'Upload Error', message: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'Invalid File', message: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Please upload a PDF document (.pdf).',
    });
  }

  try {
    const data = await extractTextFromPdf(req.file.buffer);
    return res.status(200).json({
      success: true,
      data: {
        ...data,
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
      },
    });
  } catch (err) {
    console.error('[PDF] Extraction failed:', err.message);
    return res.status(err.status || 500).json({
      error: 'PDF Extraction Failed',
      message: err.message || 'Failed to extract readable text from PDF.',
    });
  }
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

