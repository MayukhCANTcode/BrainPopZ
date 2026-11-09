import { z } from 'zod';

// Request payload schema
export const GenerateRequestSchema = z.object({
  notes: z
    .string({ required_error: 'Study notes or concept prompt is required' })
    .trim()
    .min(3, { message: 'Study notes must be at least 3 characters long' })
    .max(25000, { message: 'Input notes exceed maximum limit of 25,000 characters' }),
  mode: z.enum(['flashcards', 'quiz'], {
    errorMap: () => ({ message: 'Mode must be either "flashcards" or "quiz"' }),
  }),
  difficulty: z
    .string()
    .toLowerCase()
    .pipe(z.enum(['foundational', 'adaptive', 'exam prep']))
    .default('adaptive'),
  quantity: z
    .number()
    .int()
    .min(1, { message: 'Quantity must be at least 1' })
    .max(30, { message: 'Quantity cannot exceed 30 items per request' })
    .default(10),
});

// Flashcard response item schema
export const FlashcardItemSchema = z.object({
  question: z.string().trim().min(1, { message: 'Flashcard question cannot be empty' }),
  answer: z.string().trim().min(1, { message: 'Flashcard answer cannot be empty' }),
});

// Flashcard complete response schema
export const FlashcardResponseSchema = z.object({
  title: z.string().trim().min(1, { message: 'Flashcard deck title cannot be empty' }),
  type: z.literal('flashcards'),
  cards: z
    .array(FlashcardItemSchema)
    .min(1, { message: 'Response must contain at least 1 flashcard' }),
});

// Quiz question item schema
export const QuizQuestionItemSchema = z.object({
  question: z.string().trim().min(1, { message: 'Quiz question cannot be empty' }),
  options: z
    .array(z.string().trim().min(1, { message: 'Quiz option text cannot be empty' }))
    .length(4, { message: 'Every quiz question must have exactly four options' }),
  correctAnswer: z
    .number()
    .int()
    .min(0, { message: 'correctAnswer must be a valid option index (0 to 3)' })
    .max(3, { message: 'correctAnswer must be a valid option index (0 to 3)' }),
  explanation: z.string().trim().min(1, { message: 'Quiz question explanation cannot be empty' }),
});

// Quiz complete response schema
export const QuizResponseSchema = z.object({
  title: z.string().trim().min(1, { message: 'Quiz title cannot be empty' }),
  type: z.literal('quiz'),
  questions: z
    .array(QuizQuestionItemSchema)
    .min(1, { message: 'Response must contain at least 1 question' }),
});

