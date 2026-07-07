import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Chat ──────────────────────────────────────────────────────────────────

/**
 * Create a new chat session.
 * @returns {Promise<{ sessionId: string }>}
 */
export const createSession = async () => {
  const response = await api.post('/api/chat/session');
  return response.data;
};

/**
 * Send a message and consume the SSE stream.
 *
 * @param {string} sessionId
 * @param {string} message
 * @param {(chunk: string) => void} onChunk   - called for each streamed token
 * @param {(data: object) => void} onDone     - called when stream ends with final metadata
 * @param {(err: Error) => void}   onError    - called on stream error
 * @returns {() => void} abort function
 */
export const sendMessage = (sessionId, message, onChunk, onDone, onError) => {
  const url = `${BASE_URL}/api/chat/message`;
  const controller = new AbortController();

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Flush any remaining buffer content
            if (buffer.trim()) processBuffer(buffer, onChunk, onDone);
            onDone({});
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') {
              onDone({});
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.type === 'chunk' && parsed.content) {
                onChunk(parsed.content);
              } else if (parsed.type === 'done') {
                onDone(parsed);
              } else if (parsed.type === 'error') {
                onError(new Error(parsed.message || 'Stream error'));
              } else if (parsed.content) {
                // Fallback: plain content field
                onChunk(parsed.content);
              }
            } catch {
              // Non-JSON data line – ignore
            }
          }
        }
      };

      pump().catch((err) => {
        if (err.name !== 'AbortError') onError(err);
      });
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err);
    });

  return () => controller.abort();
};

function processBuffer(buffer, onChunk, onDone) {
  for (const line of buffer.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') { onDone({}); return; }
    try {
      const parsed = JSON.parse(payload);
      if (parsed.type === 'chunk' && parsed.content) onChunk(parsed.content);
      else if (parsed.type === 'done') onDone(parsed);
    } catch { /* ignore */ }
  }
}

/**
 * Submit a contact form when the AI can't answer.
 * @param {object} formData - { name, phone, email, question, sessionId? }
 */
export const submitContactForm = async (formData) => {
  const response = await api.post('/api/chat/contact', formData);
  return response.data;
};

// ─── Document ─────────────────────────────────────────────────────────────

/**
 * Upload a PDF document.
 * @param {File} file
 * @param {(pct: number) => void} onProgress
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data;
};

/**
 * Get current document processing status.
 */
export const getDocumentStatus = async () => {
  const response = await api.get('/api/document/status');
  return response.data;
};

// ─── Admin ────────────────────────────────────────────────────────────────

/**
 * Get chatbot usage statistics.
 */
export const getStatistics = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

/**
 * Get a list of recent chat sessions.
 * @param {number} [limit=10]
 */
export const getRecentSessions = async (limit = 10) => {
  const response = await api.get('/api/admin/sessions', { params: { limit } });
  return response.data;
};

export default api;
