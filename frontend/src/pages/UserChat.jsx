import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ContactForm from '../components/ContactForm';
import { createSession, sendMessage } from '../services/api';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! Welcome to Cincinnati Hotel's virtual concierge. 🏨\n\nI'm here to help you with information about our rooms, amenities, dining, local attractions, and more. How can I assist you today?",
  timestamp: new Date(),
};

function UserChat() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState('');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactPrefill, setContactPrefill] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null); // holds the current stream abort fn

  // ── Session init ──────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      setInitError('');
      try {
        const data = await createSession();
        setSessionId(data.sessionId);
      } catch (err) {
        setInitError(err.message || 'Could not start a session. Please refresh.');
      } finally {
        setIsInitializing(false);
      }
    };
    init();

    return () => {
      // Abort any in-flight stream on unmount
      abortRef.current?.();
    };
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isStreaming || !sessionId) return;

    // Add user message immediately
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    // Placeholder for the streaming assistant message
    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
    ]);

    let fullContent = '';

    const abort = sendMessage(
      sessionId,
      text,
      // onChunk
      (chunk) => {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: fullContent, isStreaming: true } : m
          )
        );
      },
      // onDone
      (meta) => {
        setIsStreaming(false);
        abortRef.current = null;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fullContent || m.content, isStreaming: false }
              : m
          )
        );
        // If the backend signals the AI couldn't answer, suggest contacting staff
        if (meta?.needsHumanContact) {
          setTimeout(() => {
            setContactPrefill(text);
            setIsContactFormOpen(true);
          }, 800);
        }
      },
      // onError
      (err) => {
        setIsStreaming(false);
        abortRef.current = null;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: fullContent ||
                    "I'm sorry, I encountered an error while processing your request. Please try again or contact our front desk for assistance.",
                  isStreaming: false,
                }
              : m
          )
        );
        console.error('Stream error:', err);
      }
    );

    abortRef.current = abort;
  }, [inputValue, isStreaming, sessionId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Top nav bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Back to home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">Cincinnati Hotel</h1>
            <p className="text-xs text-green-500 font-medium leading-tight">
              {isInitializing ? 'Connecting…' : initError ? 'Offline' : '● Online'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setContactPrefill(''); setIsContactFormOpen(true); }}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Contact
        </button>
      </header>

      {/* Chat window */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-3xl w-full mx-auto px-4 pb-4 pt-4">
        <div className="flex-1 overflow-y-auto pr-1 space-y-1" role="log" aria-live="polite" aria-label="Chat messages">
          {isInitializing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-primary-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <p className="text-sm">Starting your session…</p>
              </div>
            </div>
          ) : initError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium mb-1">Connection error</p>
                <p className="text-sm text-gray-500 mb-4">{initError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggestion chips – only when idle and only the welcome message exists */}
        {!isInitializing && !initError && messages.length === 1 && !isStreaming && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {[
              'What rooms do you offer?',
              'Tell me about dining options',
              'What amenities are available?',
              'How do I check in?',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setInputValue(suggestion); inputRef.current?.focus(); }}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="mt-3 flex items-end gap-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isInitializing ? 'Connecting…' : 'Ask me anything about the hotel…'}
            disabled={isInitializing || !!initError || isStreaming}
            aria-label="Message input"
            className="flex-1 resize-none px-2 py-2 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none max-h-32 disabled:opacity-50"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming || isInitializing || !!initError}
            aria-label="Send message"
            className="flex-shrink-0 w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isStreaming ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </main>

      {/* Contact form modal */}
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        sessionId={sessionId}
        prefillQuestion={contactPrefill}
      />
    </div>
  );
}

export default UserChat;
