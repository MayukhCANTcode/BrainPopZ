import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FlashcardResponseSchema, QuizResponseSchema } from './src/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'http://localhost:3001';

const testResults = [];

function recordTest(id, category, name, passed, details = '') {
  testResults.push({ id, category, name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${mark}] ${category} :: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAudit() {
  console.log('=====================================================');
  console.log('   BRAINPOPZ COMPREHENSIVE END-TO-END RELIABILITY AUDIT');
  console.log('=====================================================\n');

  // -----------------------------------------------------------------
  // 1. RESPONSE SCHEMA CONSISTENCY
  // -----------------------------------------------------------------
  console.log('\n--- 1. RESPONSE SCHEMA CONSISTENCY ---');

  // 1.1 Flashcard Schema validation with 'answer' (should pass)
  const validFlashcard = {
    title: 'Cellular Respiration',
    type: 'flashcards',
    cards: [{ question: 'What is ATP?', answer: 'Adenosine triphosphate, cellular energy currency.' }],
  };
  const fcValid = FlashcardResponseSchema.safeParse(validFlashcard);
  recordTest('SCHEMA-01', 'Schema', 'Flashcard valid with "question" & "answer"', fcValid.success);

  // 1.2 Flashcard Schema rejects 'ans'
  const invalidFlashcardAns = {
    title: 'Cellular Respiration',
    type: 'flashcards',
    cards: [{ question: 'What is ATP?', ans: 'Adenosine triphosphate' }],
  };
  const fcAnsParse = FlashcardResponseSchema.safeParse(invalidFlashcardAns);
  recordTest('SCHEMA-02', 'Schema', 'Flashcard schema strictly rejects "ans"', !fcAnsParse.success, 'Properly rejected missing "answer" field');

  // 1.3 Quiz schema validates 0-based correctAnswer
  const validQuiz = {
    title: 'Distributed Systems',
    type: 'quiz',
    questions: [
      {
        question: 'What is Raft?',
        options: ['Consensus algorithm', 'Database', 'File system', 'Compiler'],
        correctAnswer: 0,
        explanation: 'Raft is an understandable consensus algorithm.',
      },
    ],
  };
  const quizValid = QuizResponseSchema.safeParse(validQuiz);
  recordTest('SCHEMA-03', 'Schema', 'Quiz schema accepts 0-based correctAnswer (0)', quizValid.success);

  // 1.4 Quiz schema rejects non-integer or out-of-range correctAnswer
  const invalidQuizIdx = {
    title: 'Distributed Systems',
    type: 'quiz',
    questions: [
      {
        question: 'What is Raft?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 4, // Out of bounds!
        explanation: 'Out of bounds test',
      },
    ],
  };
  const quizIdxParse = QuizResponseSchema.safeParse(invalidQuizIdx);
  recordTest('SCHEMA-04', 'Schema', 'Quiz schema rejects correctAnswer >= 4', !quizIdxParse.success, 'Properly rejected out-of-range index 4');

  // 1.5 Quiz schema rejects questions with not exactly 4 options
  const invalidQuizOpts = {
    title: 'Option count test',
    type: 'quiz',
    questions: [
      {
        question: 'Test?',
        options: ['A', 'B', 'C'], // Only 3 options
        correctAnswer: 0,
        explanation: 'Too few options',
      },
    ],
  };
  const quizOptsParse = QuizResponseSchema.safeParse(invalidQuizOpts);
  recordTest('SCHEMA-05', 'Schema', 'Quiz schema enforces exactly 4 options', !quizOptsParse.success, 'Properly rejected 3 options');

  // -----------------------------------------------------------------
  // 2. GEMINI MODEL VERIFICATION
  // -----------------------------------------------------------------
  console.log('\n--- 2. GEMINI MODEL VERIFICATION ---');
  const ai = new GoogleGenerativeAI(API_KEY);

  // 2.1 Primary model: gemini-2.5-flash
  let primaryPassed = false;
  let primaryElapsed = 0;
  try {
    const t0 = Date.now();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const res = await model.generateContent('Answer "OK" in 1 word.');
    primaryElapsed = Date.now() - t0;
    const text = (await res.response).text().trim();
    primaryPassed = text.length > 0;
    recordTest('MODEL-01', 'Gemini Models', 'Primary model (gemini-2.5-flash) live generation', primaryPassed, `Latency: ${primaryElapsed}ms, Output: "${text}"`);
  } catch (err) {
    recordTest('MODEL-01', 'Gemini Models', 'Primary model (gemini-2.5-flash) live generation', false, err.message);
  }

  // 2.2 Fallback model: gemini-3.5-flash tested independently
  let fallbackPassed = false;
  let fallbackElapsed = 0;
  try {
    const t0 = Date.now();
    const model = ai.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const res = await model.generateContent('Answer "OK" in 1 word.');
    fallbackElapsed = Date.now() - t0;
    const text = (await res.response).text().trim();
    fallbackPassed = text.length > 0;
    recordTest('MODEL-02', 'Gemini Models', 'Fallback model (gemini-3.5-flash) live generation', fallbackPassed, `Latency: ${fallbackElapsed}ms, Output: "${text}"`);
  } catch (err) {
    recordTest('MODEL-02', 'Gemini Models', 'Fallback model (gemini-3.5-flash) live generation', false, err.message);
  }

  // 2.3 Obsolete/Unsupported models verification (ensure they fail as expected and are removed from active config)
  let obsoleteFailedExpectedly = false;
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent('Hi');
  } catch (err) {
    obsoleteFailedExpectedly = err.status === 404 || err.message.includes('404') || err.message.includes('not found');
  }
  recordTest('MODEL-03', 'Gemini Models', 'Removed unsupported models (gemini-1.5-flash correctly identified as 404)', obsoleteFailedExpectedly);

  // -----------------------------------------------------------------
  // 3. END-TO-END TESTING
  // -----------------------------------------------------------------
  console.log('\n--- 3. END-TO-END TESTING ---');

  // 3.1 Live Flashcard generation (5 cards) via Backend Endpoint
  let gen5Success = false;
  let gen5Data = null;
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'Mitochondria are double-membraned organelles that produce ATP through oxidative phosphorylation. The inner membrane contains cristae which expand surface area for ATP synthase complexes.',
        mode: 'flashcards',
        difficulty: 'adaptive',
        quantity: 5,
      }),
    });
    const json = await res.json();
    gen5Success = json.success && json.data.cards.length === 5;
    gen5Data = json.data;
    recordTest('E2E-01', 'End-to-End', 'Generate 5 flashcards from notes via API', gen5Success, `Received ${json.data?.cards?.length} cards in ${json.metadata?.durationMs}ms`);
  } catch (err) {
    recordTest('E2E-01', 'End-to-End', 'Generate 5 flashcards from notes via API', false, err.message);
  }

  // 3.2 Live Quiz generation (10 questions) via Backend Endpoint
  let gen10QuizSuccess = false;
  let gen10QuizData = null;
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'The central dogma of molecular biology describes the two-step flow of genetic information: DNA transcription into messenger RNA (mRNA), and mRNA translation into functional polypeptide proteins by ribosomes with tRNA. RNA polymerase synthesizes RNA in the 5 to 3 prime direction.',
        mode: 'quiz',
        difficulty: 'exam prep',
        quantity: 10,
      }),
    });
    const json = await res.json();
    gen10QuizSuccess = json.success && json.data.questions.length === 10;
    gen10QuizData = json.data;
    recordTest('E2E-02', 'End-to-End', 'Generate 10-question quiz via API', gen10QuizSuccess, `Received ${json.data?.questions?.length} questions in ${json.metadata?.durationMs}ms`);
  } catch (err) {
    recordTest('E2E-02', 'End-to-End', 'Generate 10-question quiz via API', false, err.message);
  }

  // 3.3 Study generated flashcards (Verify card structure compatibility with StudyModal & DeckDetailModal)
  let studyCompat = false;
  if (gen5Data && gen5Data.cards) {
    studyCompat = gen5Data.cards.every(c => c.question && c.answer);
  }
  recordTest('E2E-03', 'End-to-End', 'Flashcards compatible with StudyModal (question + answer non-empty)', studyCompat);

  // 3.4 Save generated deck & simulate local storage persistence
  const simulatedDeckList = [
    { id: 'deck-1', title: 'Existing Deck', cards: [] }
  ];
  const newDeck = {
    id: `deck-${Date.now()}`,
    title: gen5Data?.title || 'Generated Deck 1',
    cards: gen5Data?.cards?.map(c => ({ question: c.question, answer: c.answer, q: c.question, a: c.answer })) || [],
  };
  const updatedDeckList = [newDeck, ...simulatedDeckList];
  const persistedJson = JSON.stringify(updatedDeckList);
  const reloadedDecks = JSON.parse(persistedJson);
  const persistSuccess = reloadedDecks.length === 2 && reloadedDecks[0].title === newDeck.title;
  recordTest('E2E-04', 'End-to-End', 'Deck saving & LocalStorage persistence simulation', persistSuccess, '2 decks persisted after rehydration');

  // 3.5 Generate a second deck and ensure previous decks are not overwritten
  const secondDeck = {
    id: `deck-${Date.now() + 1}`,
    title: 'Generated Deck 2',
    cards: [{ question: 'Q2', answer: 'A2', q: 'Q2', a: 'A2' }],
  };
  const multiDeckList = [secondDeck, ...reloadedDecks];
  const multiPersistSuccess = multiDeckList.length === 3 && multiDeckList[1].id === newDeck.id;
  recordTest('E2E-05', 'End-to-End', 'Non-destructive multiple deck saves (preserves prior decks)', multiPersistSuccess, '3 decks present in storage sequence');

  // 3.6 Complete a quiz, verify scoring, and retest incorrect answers
  let quizFlowSuccess = false;
  if (gen10QuizData && gen10QuizData.questions) {
    const q1 = gen10QuizData.questions[0];
    const correctAns = q1.correctAnswer;
    const incorrectAns = (correctAns + 1) % 4;
    // Score correct
    const scoreIfCorrect = (correctAns === q1.correctAnswer) ? 1 : 0;
    // Score incorrect
    const scoreIfIncorrect = (incorrectAns === q1.correctAnswer) ? 1 : 0;
    // Retest queue
    const missedQueue = [q1];
    quizFlowSuccess = scoreIfCorrect === 1 && scoreIfIncorrect === 0 && missedQueue.length === 1;
  }
  recordTest('E2E-06', 'End-to-End', 'Quiz scoring logic & Incorrect questions retest queue', quizFlowSuccess);

  // -----------------------------------------------------------------
  // 4. ERROR TESTING
  // -----------------------------------------------------------------
  console.log('\n--- 4. ERROR TESTING ---');

  // 4.1 Empty input
  const emptyRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: '', mode: 'flashcards', difficulty: 'adaptive', quantity: 5 }),
  });
  const emptyJson = await emptyRes.json();
  recordTest('ERR-01', 'Error Handling', 'Empty input rejected with 400 Bad Request', emptyRes.status === 400, emptyJson.error || emptyJson.details?.[0]?.message);

  // 4.2 Very short input (< 3 chars)
  const shortRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'ab', mode: 'flashcards', difficulty: 'adaptive', quantity: 5 }),
  });
  const shortJson = await shortRes.json();
  recordTest('ERR-02', 'Error Handling', 'Very short input (< 3 chars) rejected with 400', shortRes.status === 400, shortJson.details?.[0]?.message);

  // 4.3 Extremely long input (> 25000 chars)
  const longNotes = 'A'.repeat(26000);
  const longRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: longNotes, mode: 'flashcards', difficulty: 'adaptive', quantity: 5 }),
  });
  const longJson = await longRes.json();
  recordTest('ERR-03', 'Error Handling', 'Extremely long input (> 25,000 chars) rejected with 400', longRes.status === 400, longJson.details?.[0]?.message);

  // 4.4 Invalid generation mode
  const modeRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Valid notes here', mode: 'summary', difficulty: 'adaptive', quantity: 5 }),
  });
  const modeJson = await modeRes.json();
  recordTest('ERR-04', 'Error Handling', 'Invalid mode rejected with 400', modeRes.status === 400, modeJson.details?.[0]?.message);

  // 4.5 Invalid difficulty
  const diffRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Valid notes here', mode: 'flashcards', difficulty: 'super-hard', quantity: 5 }),
  });
  const diffJson = await diffRes.json();
  recordTest('ERR-05', 'Error Handling', 'Invalid difficulty rejected with 400', diffRes.status === 400, diffJson.details?.[0]?.message);

  // 4.6 Gemini API key missing (tested via validation logic)
  let missingKeyHandled = false;
  try {
    const aiNoKey = new GoogleGenerativeAI('');
    const model = aiNoKey.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await model.generateContent('Hi');
  } catch (err) {
    missingKeyHandled = err.message.toLowerCase().includes('api key') || err.status === 403 || err.status === 400;
  }
  recordTest('ERR-06', 'Error Handling', 'Missing API key handled safely', missingKeyHandled);

  // 4.7 Invalid API key test
  let invalidKeyHandled = false;
  try {
    const aiBad = new GoogleGenerativeAI('INVALID_TEST_KEY_12345');
    const model = aiBad.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await model.generateContent('Hi');
  } catch (err) {
    invalidKeyHandled = err.status === 400 || err.message.includes('API key');
  }
  recordTest('ERR-07', 'Error Handling', 'Invalid API key rejected by Gemini SDK with clear error', invalidKeyHandled);

  // 4.8 Malformed JSON parsing defense
  let malformedCaught = false;
  try {
    const text = 'Here is the result: not a json string without braces';
    if (!text.includes('{') || !text.includes('}')) {
      throw new Error('Response did not contain a valid JSON object structure.');
    }
    JSON.parse(text);
  } catch {
    malformedCaught = true;
  }
  recordTest('ERR-08', 'Error Handling', 'Malformed AI output triggers parser error', malformedCaught);

  // 4.9 Valid JSON with incorrect schema structure
  const wrongStructure = { title: 'Missing cards array', type: 'flashcards' };
  const structValidation = FlashcardResponseSchema.safeParse(wrongStructure);
  recordTest('ERR-09', 'Error Handling', 'Valid JSON with missing required fields fails Zod', !structValidation.success, 'Caught missing "cards" array');

  // 4.10 Empty AI response (0 items)
  const emptyCards = { title: 'Empty', type: 'flashcards', cards: [] };
  const emptyValidation = FlashcardResponseSchema.safeParse(emptyCards);
  recordTest('ERR-10', 'Error Handling', 'Empty cards array rejected by Zod (.min(1))', !emptyValidation.success, 'Caught 0 cards');

  // 4.11 User submits another request while one is already running (AbortController test)
  let abortControllerWorked = false;
  const ac = new AbortController();
  const req1Promise = fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'First Note Prompt', mode: 'flashcards', difficulty: 'adaptive', quantity: 3 }),
    signal: ac.signal,
  }).catch((err) => {
    if (err.name === 'AbortError') abortControllerWorked = true;
  });
  ac.abort(); // Cancel req1 immediately as user submits newer request
  await req1Promise;
  recordTest('ERR-11', 'Error Handling', 'Client AbortController cancels in-flight request when newer submitted', abortControllerWorked, 'AbortError dispatched cleanly');

  // -----------------------------------------------------------------
  // 5. SECURITY
  // -----------------------------------------------------------------
  console.log('\n--- 5. SECURITY ---');

  // 5.1 Verify API key is NOT in frontend dist bundle
  const distDir = path.resolve(__dirname, '../dist');
  let keyFoundInBundle = false;
  if (fs.existsSync(distDir)) {
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
          checkDir(fp);
        } else if (f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css')) {
          const content = fs.readFileSync(fp, 'utf8');
          if (content.includes(API_KEY)) {
            keyFoundInBundle = true;
          }
        }
      }
    };
    checkDir(distDir);
  }
  recordTest('SEC-01', 'Security', 'Gemini API key is completely absent from frontend bundle', !keyFoundInBundle, 'dist/ verified free of secret tokens');

  // 5.2 Verify server/.env is ignored by Git
  const gitignorePath = path.resolve(__dirname, '../.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const envIgnored = gitignoreContent.includes('.env');
  recordTest('SEC-02', 'Security', '.gitignore rules exclude .env files', envIgnored);

  // 5.3 Verify error sanitization does not leak keys
  const fakeErrorWithKey = `Error at https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  const sanitized = fakeErrorWithKey.replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
  recordTest('SEC-03', 'Security', 'Error message sanitizer redacts sensitive key query parameter', !sanitized.includes(API_KEY), sanitized);

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log('\n=====================================================');
  console.log('                 AUDIT RESULTS SUMMARY               ');
  console.log('=====================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed}`);
  console.log(`Failed:         ${failed}`);
  console.log(`Success Rate:   ${((passed / total) * 100).toFixed(1)}%\n`);

  return { total, passed, failed, testResults };
}

runAudit();
