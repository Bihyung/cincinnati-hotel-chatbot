import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StatisticsCard from '../components/StatisticsCard';
import FileUploadSection from '../components/FileUploadSection';
import { getStatistics, getRecentSessions } from '../services/api';

const REFRESH_INTERVAL = 10_000; // 10 seconds

// ── Icon helpers ──────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'upload'
  const timerRef = useRef(null);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const [stats, sessions] = await Promise.all([
        getStatistics(),
        getRecentSessions(10),
      ]);
      setStatistics(stats);
      setRecentSessions(sessions?.sessions ?? sessions ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    timerRef.current = setInterval(() => fetchData(), REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Topic breakdown ─────────────────────────────────────────────────────────

  const topicEntries = statistics?.questionsByTopic
    ? Object.entries(statistics.questionsByTopic).sort((a, b) => b[1] - a[1])
    : [];

  const totalTopicQuestions = topicEntries.reduce((sum, [, n]) => sum + n, 0);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Back to home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <ChartIcon />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500 leading-tight">Cincinnati Hotel Chatbot</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastRefresh && (
                <p className="hidden sm:block text-xs text-gray-400">
                  Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 -mb-px">
            {['overview', 'upload'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' ? 'Overview' : 'Upload Document'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats grid */}
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticsCard
                  title="Total Sessions"
                  value={statistics?.totalSessions ?? 0}
                  subtitle="all time"
                  icon={<UsersIcon />}
                  color="blue"
                  loading={loading}
                />
                <StatisticsCard
                  title="Total Questions"
                  value={statistics?.totalQuestions ?? 0}
                  subtitle="messages sent by guests"
                  icon={<ChatIcon />}
                  color="purple"
                  loading={loading}
                />
                <StatisticsCard
                  title="Contact Requests"
                  value={statistics?.contactRequests ?? 0}
                  subtitle="forms submitted"
                  icon={<ContactIcon />}
                  color="rose"
                  loading={loading}
                />
                <StatisticsCard
                  title="Avg. Session Length"
                  value={statistics?.avgSessionDuration ? formatDuration(statistics.avgSessionDuration) : '—'}
                  subtitle="per guest"
                  icon={<ChartIcon />}
                  color="green"
                  loading={loading}
                />
              </div>
            </section>

            {/* Topics + Recent sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic breakdown */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Questions by Topic</h2>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                ) : topicEntries.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No topic data yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {topicEntries.map(([topic, count]) => {
                      const pct = totalTopicQuestions > 0 ? Math.round((count / totalTopicQuestions) * 100) : 0;
                      return (
                        <li key={topic}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 capitalize">{topic}</span>
                            <span className="text-gray-500">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Recent sessions */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Sessions</h2>
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-sm">No sessions recorded yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {recentSessions.map((session) => (
                      <li
                        key={session.id || session.sessionId}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-mono text-gray-500 truncate">
                              {(session.id || session.sessionId || '').slice(0, 12)}…
                            </p>
                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                              session.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {session.status || 'ended'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span>{session.messageCount ?? 0} messages</span>
                            {session.createdAt && <span>{formatTime(session.createdAt)}</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ── UPLOAD TAB ── */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Hotel Document</h2>
                <p className="text-sm text-gray-500">
                  Upload a PDF containing hotel information. The AI assistant will use this document
                  to answer guest questions accurately.
                </p>
              </div>
              <FileUploadSection
                onUploadSuccess={() => {
                  // Switch back to overview after upload
                  setTimeout(() => setActiveTab('overview'), 1500);
                }}
              />

              {/* Tips */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Tips for best results</h3>
                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                  <li>Include room types, pricing, and availability information.</li>
                  <li>Add details about dining, spa, and recreational amenities.</li>
                  <li>Include check-in/check-out policies and FAQs.</li>
                  <li>List nearby attractions and transportation options.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Auto-refreshes every 10s
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
