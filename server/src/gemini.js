import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FlashcardResponseSchema, QuizResponseSchema } from './validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Primary and fallback models supported by modern Gemini API
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash';

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured on the server. Please set it in server/.env.');
    error.status = 500;
    throw error;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Builds the strict system prompt and generation instructions for Gemini.
 */
function buildPrompt({ notes, mode, difficulty, quantity }) {
  if (mode === 'flashcards') {
    return `You are BrainPopZ AI, an expert educational study assistant specializing in active recall and spaced repetition.

Analyze the following study material and synthesize exactly ${quantity} high-yield, conceptually rich flashcards at the "${difficulty}" difficulty level.

STUDY MATERIAL:
"""
${notes}
"""

STRICT INSTRUCTIONS:
1. Provide a concise, descriptive "title" for the deck.
2. Set "type" to "flashcards".
3. Provide an array of ${quantity} "cards", each containing:
   - "question": A clear, direct concept or problem testing active recall.
   - "answer": A comprehensive, accurate, high-yield explanation.
4. Output MUST BE strictly valid JSON conforming exactly to this structure:
{
  "title": "Topic title",
  "type": "flashcards",
  "cards": [
    {
      "question": "Question here",
      "answer": "Answer here"
    }
  ]
}
Do NOT include markdown code blocks, preamble, or any text outside the JSON object.`;
  }

  // Quiz mode
  return `You are BrainPopZ AI, an expert exam preparation tutor specializing in diagnostic multiple-choice assessments.

Analyze the following study material and generate exactly ${quantity} multiple-choice quiz questions at the "${difficulty}" difficulty level.

STUDY MATERIAL:
"""
${notes}
"""

STRICT INSTRUCTIONS:
1. Provide a concise, descriptive "title" for the quiz.
2. Set "type" to "quiz".
3. Provide an array of ${quantity} "questions", each containing:
   - "question": An insightful diagnostic question.
   - "options": An array of EXACTLY 4 plausible answer options.
   - "correctAnswer": The 0-based integer index of the correct option (0, 1, 2, or 3).
   - "explanation": A thorough scientific or logical explanation why that option is correct and why common misconceptions fail.
4. Output MUST BE strictly valid JSON conforming exactly to this structure:
{
  "title": "Topic title",
  "type": "quiz",
  "questions": [
    {
      "question": "Question here",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation here"
    }
  ]
}
Do NOT include markdown code blocks, preamble, or any text outside the JSON object.`;
}

/**
 * Extracts and cleans raw JSON text from Gemini output.
 */
function extractJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Gemini returned an empty response string.');
  }

  let text = rawText.trim();

  // Strip Markdown ```json and ``` code wrappers if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Find first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('Response did not contain a valid JSON object structure.');
  }

  const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSubstring);
}

/**
 * Calls Gemini API with structured JSON output and validates the response with Zod.
 */
export async function generateStudyAsset({ notes, mode, difficulty, quantity }) {
  const genAI = getGenAI();

  const prompt = buildPrompt({ notes, mode, difficulty, quantity });

  let rawContent = null;
  let usedModel = PRIMARY_MODEL;

  // Helper to execute generation with timeout
  const executeGeneration = async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    // 25 second timeout safeguard
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout: Gemini API took longer than 25 seconds to respond.')), 25000)
    );

    const apiPromise = model.generateContent(prompt);
    const response = await Promise.race([apiPromise, timeoutPromise]);
    return response.response.text();
  };

  try {
    rawContent = await executeGeneration(PRIMARY_MODEL);
  } catch (err) {
    console.warn(`Primary model (${PRIMARY_MODEL}) error:`, err.message);

    // If 503 or model error, attempt fallback model
    if (
      err.message.includes('503') ||
      err.message.includes('not found') ||
      err.message.includes('temporarily') ||
      err.status === 503 ||
      err.status === 404
    ) {
      console.log(`Attempting fallback to ${FALLBACK_MODEL}...`);
      usedModel = FALLBACK_MODEL;
      rawContent = await executeGeneration(FALLBACK_MODEL);
    } else {
      throw err;
    }
  }

  // Parse JSON from text
  let parsedJson;
  try {
    parsedJson = extractJSON(rawContent);
  } catch (jsonErr) {
    const error = new Error(`Failed to parse AI output as valid JSON: ${jsonErr.message}`);
    error.status = 502;
    error.raw = rawContent;
    throw error;
  }

  // Validate strictly with Zod according to mode
  if (mode === 'flashcards') {
    const validationResult = FlashcardResponseSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const error = new Error(
        `AI flashcard output failed schema validation: ${validationResult.error.issues.map((i) => i.message).join(', ')}`
      );
      error.status = 502;
      error.issues = validationResult.error.issues;
      throw error;
    }
    return {
      ...validationResult.data,
      modelUsed: usedModel,
    };
  } else {
    const validationResult = QuizResponseSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const error = new Error(
        `AI quiz output failed schema validation: ${validationResult.error.issues.map((i) => i.message).join(', ')}`
      );
      error.status = 502;
      error.issues = validationResult.error.issues;
      throw error;
    }
    return {
      ...validationResult.data,
      modelUsed: usedModel,
    };
  }
}
