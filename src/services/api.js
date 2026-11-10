/**
 * BrainPopZ API Client
 * Communicates with the Express backend on http://localhost:3001
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class APIError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Sends notes and generation instructions to the BrainPopZ Gemini backend.
 *
 * @param {Object} params
 * @param {string} params.notes - Raw study notes or concept prompt
 * @param {'flashcards'|'quiz'} params.mode - Output mode
 * @param {'foundational'|'adaptive'|'exam prep'} [params.difficulty='adaptive']
 * @param {number} [params.quantity=10]
 * @param {AbortSignal} [params.signal] - For request cancellation
 * @returns {Promise<Object>} Validated generation data
 */
export async function generateContent({
  notes,
  mode,
  difficulty = 'adaptive',
  quantity = 10,
  signal,
}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        notes,
        mode,
        difficulty,
        quantity,
      }),
      signal,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') {
      throw networkError;
    }
    throw new APIError(
      'Cannot connect to BrainPopZ backend server. Ensure the backend is running on port 3001.',
      0
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new APIError(
      'Server returned an unparseable response.',
      response.status
    );
  }

  if (!response.ok || !data.success) {
    const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
    throw new APIError(errorMsg, response.status, data.details || null);
  }

  return data.data;
}

/**
 * Checks server health status.
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return { healthy: false };
    return await res.json();
  } catch {
    return { healthy: false };
  }
}

/**
 * Authenticates with the backend using a Google ID token credential.
 * Sets a secure HTTP-only cookie on the client.
 */
export async function loginWithGoogle(credential) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });
  } catch {
    throw new APIError('Cannot connect to backend server for authentication.', 0);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new APIError('Authentication server returned an unparseable response.', res.status);
  }

  if (!res.ok || !data.success) {
    throw new APIError(data.message || 'Google sign-in failed.', res.status);
  }

  return data.user;
}

/**
 * Restores the active user session from the HTTP-only cookie.
 */
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.authenticated ? data.user : null;
  } catch {
    return null;
  }
}

/**
 * Logs out the active user session by clearing the HTTP-only cookie.
 */
export async function logoutUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches transcript and metadata for a given YouTube URL.
 *
 * @param {string} url - YouTube video URL or video ID
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>} { videoId, title, author, thumbnail, transcript, wordCount, estimatedMinutes }
 */
export async function fetchYouTubeTranscript(url, signal) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/youtube-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ url }),
      signal,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') throw networkError;
    throw new APIError(
      'Cannot connect to BrainPopZ backend server. Ensure the backend is running.',
      0
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new APIError('Server returned an unparseable response.', response.status);
  }

  if (!response.ok || !data.success) {
    const errorMsg = data.message || data.error || `Failed to retrieve YouTube transcript (${response.status})`;
    throw new APIError(errorMsg, response.status, data.details || null);
  }

  return data.data;
}

/**
 * Uploads a PDF document to extract text and slide contents.
 *
 * @param {File} file - PDF file object
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>} { pageCount, wordCount, characterCount, estimatedMinutes, text, fileName, fileSizeBytes }
 */
export async function extractPdfDocument(file, signal) {
  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/extract-pdf`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') throw networkError;
    throw new APIError('Cannot connect to BrainPopZ backend server. Ensure backend is running.', 0);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new APIError('Server returned an unparseable response.', response.status);
  }

  if (!response.ok || !data.success) {
    const errorMsg = data.message || data.error || `Failed to extract text from PDF (${response.status})`;
    throw new APIError(errorMsg, response.status, data.details || null);
  }

  return data.data;
}
