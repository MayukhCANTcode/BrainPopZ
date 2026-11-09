import { Router } from 'express';
import { GenerateRequestSchema } from './validators.js';
import { generateStudyAsset } from './gemini.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BrainPopZ AI Generation Engine',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// POST /api/generate endpoint
apiRouter.post('/generate', async (req, res) => {
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
    const message = err.message || '';

    if (message.includes('API key') || message.includes('API_KEY')) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid or missing Google Gemini API key. Please check the server configuration.',
      });
    }

    if (message.includes('429') || message.includes('quota') || message.includes('ResourceExhausted')) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Google Gemini API rate limit exceeded. Please wait a moment before trying again.',
      });
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'The AI request timed out. Try reducing note length or deck size.',
      });
    }

    if (err.status === 502 || message.includes('validation') || message.includes('JSON')) {
      return res.status(502).json({
        error: 'AI Output Validation Error',
        message: err.message || 'Gemini output failed structural schema validation.',
      });
    }

    return res.status(err.status || 500).json({
      error: 'Generation Failed',
      message: err.message || 'An unexpected error occurred while communicating with Google Gemini.',
    });
  }
});
