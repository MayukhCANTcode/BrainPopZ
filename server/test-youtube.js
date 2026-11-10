import { getYouTubeTranscript } from './src/youtube.js';

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('=====================================================');
  console.log('   BRAINPOPZ YOUTUBE TRANSCRIPT & AI PIPELINE TEST   ');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`[✅ PASS] ${name} ${details ? '-> ' + details : ''}`);
      passed++;
    } else {
      console.error(`[❌ FAIL] ${name} ${details ? '-> ' + details : ''}`);
    }
  }

  // 1. Direct unit test of getYouTubeTranscript
  try {
    const data = await getYouTubeTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert(
      data.videoId === 'dQw4w9WgXcQ' && data.wordCount > 100 && data.title,
      'YT-01: Direct YouTube transcript & oEmbed extractor',
      `Title: "${data.title.slice(0, 30)}...", Words: ${data.wordCount}`
    );
  } catch (err) {
    assert(false, 'YT-01: Direct YouTube transcript extractor', err.message);
  }

  // 2. Unauthenticated request to /api/youtube-transcript is rejected with 401
  try {
    const res = await fetch(`${BASE_URL}/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    });
    assert(res.status === 401, 'YT-02: Unauthenticated access rejected with 401', `Status: ${res.status}`);
  } catch (err) {
    assert(false, 'YT-02: Unauthenticated access', err.message);
  }

  // 3. Authenticate with dev credential to get real session cookie
  let sessionCookie = '';
  try {
    const authRes = await fetch(`${BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'dev-eval-token:mayukh.student@brainpopz.edu' }),
    });
    const setCookie = authRes.headers.get('set-cookie') || '';
    sessionCookie = setCookie.split(';')[0];
  } catch (err) {
    console.warn('Auth setup failed:', err.message);
  }

  // 4. Authenticated request with session cookie
  let fetchedTranscriptData = null;
  try {
    const res = await fetch(`${BASE_URL}/youtube-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ url: 'https://youtu.be/dQw4w9WgXcQ' }),
    });
    const json = await res.json();
    fetchedTranscriptData = json.data;
    assert(
      res.status === 200 && json.success && json.data.transcript.length > 50,
      'YT-03: Authenticated /api/youtube-transcript succeeds',
      `Title: "${json.data?.title?.slice(0, 25)}...", Words: ${json.data?.wordCount}`
    );
  } catch (err) {
    assert(false, 'YT-03: Authenticated /api/youtube-transcript', err.message);
  }

  // 5. Invalid YouTube link rejected with 400
  try {
    const res = await fetch(`${BASE_URL}/youtube-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ url: 'not-a-valid-youtube-link' }),
    });
    const json = await res.json();
    assert(
      res.status === 400,
      'YT-04: Invalid YouTube link returns 400 Bad Request',
      `Status: ${res.status}: ${json.message}`
    );
  } catch (err) {
    assert(false, 'YT-04: Invalid YouTube link', err.message);
  }

  // 6. Complete pipeline: Feed YouTube transcript directly into Gemini /api/generate!
  if (fetchedTranscriptData) {
    try {
      console.log('\n[TEST] Feeding YouTube transcript into Gemini 2.5 Flash for 3 flashcards...');
      const genRes = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          notes: `Source: YouTube Video "${fetchedTranscriptData.title}"\nTranscript:\n${fetchedTranscriptData.transcript.slice(0, 1500)}`,
          mode: 'flashcards',
          difficulty: 'adaptive',
          quantity: 3,
        }),
      });

      const genJson = await genRes.json();
      assert(
        genRes.status === 200 && genJson.data?.cards?.length >= 1,
        'YT-05: Gemini AI synthesizes flashcards from YouTube transcript',
        `Generated ${genJson.data?.cards?.length} cards for "${genJson.data?.title}"`
      );
    } catch (err) {
      assert(false, 'YT-05: Gemini AI generation from transcript', err.message);
    }
  }

  console.log('\n=====================================================');
  console.log(`Total Tests: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('=====================================================');
}

runTests();
