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
