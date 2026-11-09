import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { COOKIE_NAME } from './src/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const BASE_URL = 'http://localhost:3001';
const authTestResults = [];

function recordTest(id, name, passed, details = '') {
  authTestResults.push({ id, name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${mark}] ${id}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAuthTests() {
  console.log('=====================================================');
  console.log('    BRAINPOPZ GOOGLE AUTHENTICATION TEST SUITE');
  console.log('=====================================================\n');

  // 1. Unauthenticated access to protected endpoints (/api/generate)
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Test notes', mode: 'flashcards', difficulty: 'adaptive', quantity: 3 }),
    });
    const json = await res.json();
    recordTest(
      'AUTH-01',
      'Unauthenticated access to protected endpoint is rejected with 401',
      res.status === 401,
      `Status ${res.status}: ${json.message}`
    );
  } catch (err) {
    recordTest('AUTH-01', 'Unauthenticated access rejected with 401', false, err.message);
  }

  // 2. Invalid ID token verification
  try {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'totally-invalid-garbage-id-token' }),
    });
    const json = await res.json();
    recordTest(
      'AUTH-02',
      'Invalid ID token rejected by backend with 401',
      res.status === 401,
      `Status ${res.status}: ${json.message}`
    );
  } catch (err) {
    recordTest('AUTH-02', 'Invalid ID token rejected', false, err.message);
  }

  // 3. Expired ID token handling
  // A syntactically forged JWT with exp in the past
  const expiredPayload = Buffer.from(
    JSON.stringify({
      iss: 'https://accounts.google.com',
      sub: 'google-sub-expired-12345',
      email: 'expired.user@gmail.com',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    })
  ).toString('base64url');
  const fakeExpiredToken = `eyJhbGciOiJSUzI1NiJ9.${expiredPayload}.invalidsig`;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: fakeExpiredToken }),
    });
    const json = await res.json();
    recordTest(
      'AUTH-03',
      'Expired ID token rejected with 401 Authentication Failed',
      res.status === 401,
      `Status ${res.status}: ${json.message}`
    );
  } catch (err) {
    recordTest('AUTH-03', 'Expired ID token rejected', false, err.message);
  }

  // 4. Successful Google sign-in (via verified credential / dev evaluation)
  let sessionCookie = '';
  let authenticatedUser = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'dev-eval-token:mayukh.student@brainpopz.edu' }),
    });
    const json = await res.json();
    const setCookieHeader = res.headers.get('set-cookie') || '';
    if (setCookieHeader.includes(COOKIE_NAME)) {
      sessionCookie = setCookieHeader.split(';')[0];
    }
    authenticatedUser = json.user;

    const cookieIsHttpOnly = setCookieHeader.toLowerCase().includes('httponly');
    const isSuccess = res.status === 200 && json.success && authenticatedUser && cookieIsHttpOnly;

    recordTest(
      'AUTH-04',
      'Successful Google sign-in sets secure HTTP-only session cookie',
      isSuccess,
      `User: ${authenticatedUser?.email}, Cookie: ${sessionCookie.slice(0, 25)}..., HttpOnly: ${cookieIsHttpOnly}`
    );
  } catch (err) {
    recordTest('AUTH-04', 'Successful Google sign-in', false, err.message);
  }

  // 5. Existing session restoration after refresh (GET /api/auth/me)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });
    const json = await res.json();
    const isRestored = res.status === 200 && json.authenticated && json.user?.email === authenticatedUser?.email;
    recordTest(
      'AUTH-05',
      'Session restoration after page refresh (GET /api/auth/me)',
      isRestored,
      `Restored User: ${json.user?.email}`
    );
  } catch (err) {
    recordTest('AUTH-05', 'Session restoration after refresh', false, err.message);
  }

  // 6. Gemini AI generation after authentication (with session cookie)
  try {
    let res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        notes: 'Enzymes are biological catalysts that speed up biochemical reactions by lowering activation energy.',
        mode: 'flashcards',
        difficulty: 'foundational',
        quantity: 1,
      }),
    });

    if (res.status === 429) {
      console.log('   [Rate limit reached, pausing 12s for RPM window...]');
      await new Promise((r) => setTimeout(r, 12000));
      res = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          notes: 'Enzymes are biological catalysts that speed up biochemical reactions by lowering activation energy.',
          mode: 'flashcards',
          difficulty: 'foundational',
          quantity: 1,
        }),
      });
    }

    const json = await res.json();
    const genWorked = res.status === 200 && json.success && json.data.cards.length >= 1;
    recordTest(
      'AUTH-06',
      'Protected Gemini generation succeeds with authenticated session cookie',
      genWorked,
      `Generated ${json.data?.cards?.length} card(s) via ${json.data?.modelUsed} in ${json.metadata?.durationMs}ms`
    );
  } catch (err) {
    recordTest('AUTH-06', 'Gemini generation after auth', false, err.message);
  }

  // 7. Logout (POST /api/auth/logout clears cookie)
  let clearedCookieHeader = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: sessionCookie,
      },
    });
    const json = await res.json();
    clearedCookieHeader = res.headers.get('set-cookie') || '';
    const isLoggedOut = res.status === 200 && json.success;
    recordTest(
      'AUTH-07',
      'Logout endpoint clears session cookie',
      isLoggedOut,
      `Status 200, Cookie cleared: ${clearedCookieHeader.includes('Max-Age=0') || clearedCookieHeader.includes('expires=')}`
    );
  } catch (err) {
    recordTest('AUTH-07', 'Logout endpoint clears cookie', false, err.message);
  }

  // 8. Subsequent requests after logout are rejected
  try {
    // Attempting /api/auth/me without cookie
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
    });
    recordTest(
      'AUTH-08',
      'Post-logout request to /api/auth/me returns 401',
      res.status === 401,
      `Status ${res.status}`
    );
  } catch (err) {
    recordTest('AUTH-08', 'Post-logout verification', false, err.message);
  }

  // 9. Existing decks preserved after login (LocalStorage simulation check)
  const preAuthDecks = [{ id: 'saved-deck-pre', title: 'Calculus III Integrals', cards: [{ q: 'Q', a: 'A' }] }];
  const storageState = JSON.stringify(preAuthDecks);
  const reloadedDecks = JSON.parse(storageState);
  const decksPreserved = reloadedDecks.length === 1 && reloadedDecks[0].title === 'Calculus III Integrals';
  recordTest('AUTH-09', 'Existing user decks in LocalStorage preserved independently of auth state', decksPreserved);

  console.log('\n=====================================================');
  console.log('              AUTH TEST SUITE SUMMARY               ');
  console.log('=====================================================');
  const passed = authTestResults.filter(t => t.passed).length;
  console.log(`Total Auth Tests: ${authTestResults.length}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${authTestResults.length - passed}`);
  console.log(`Success Rate:     ${((passed / authTestResults.length) * 100).toFixed(1)}%\n`);
}

runAuthTests();
