'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { Content, Intent, Recommendation } from '../types';
import Header from '../components/Header';
import ContentCard from '../components/ContentCard';
import ContentDetail from '../components/ContentDetail';
import SessionInsight from '../components/SessionInsight';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const fallback: Content[] = Array.from({ length: 12 }, (_, i) => ({
  id: `event_${String(i + 1).padStart(3, '0')}`,
  title: [
    'Champions Under Lights',
    'City Rivals Preview',
    'Weekend Football Briefing',
    'The Midfield Report',
    'Women’s Football Focus',
    'Basketball: Full Court Pulse',
    'Rising Hoops: Weekly Roundup',
    'Tennis: Baseline Stories',
    'Grand Slam Roadmap',
    'Live Court Watch',
    'Football: The Long View',
    'Courtside Context'
  ][i],
  category: i < 5 || i > 9 ? 'Football' : i < 7 ? 'Basketball' : i < 9 ? 'Tennis' : 'Live',
  startTime: i === 9 ? 'Now' : i % 2 ? 'Tonight' : 'Upcoming',
  tags: [],
  popularity: 80 - i,
  status: i === 9 ? 'Live' : 'Upcoming',
  venue: 'Demo venue',
  description: 'A concise, informative session with the context you need to decide what is useful for you.',
  accent: '#64e6b1'
}));

const fallbackIntent: Intent = { intent: 'GENERAL_DISCOVERY', confidence: 0.42, signals: [] };

export default function Home() {
  const [page, setPage] = useState<'home' | 'analytics' | 'demo-select'>('demo-select');
  const [items, setItems] = useState<Content[]>(fallback);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sessionId, setSessionId] = useState('');
  const [intent, setIntent] = useState<Intent>(fallbackIntent);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [detail, setDetail] = useState<Content | null>(null);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [sessionMode, setSessionMode] = useState<'control' | 'intelligent'>('intelligent');

  const filtered = useMemo(
    () =>
      items.filter(
        x =>
          (category === 'All' || x.category === category) &&
          (!query || `${x.title} ${x.category}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [items, category, query]
  );

  async function start(mode: 'control' | 'intelligent') {
    setSessionMode(mode);
    try {
      const r: any = await api('/session/start', {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      setSessionId(r.data.id);
      setStarted(true);
      setPage('home');
    } catch {
      setSessionId(`demo_${Date.now()}`);
      setStarted(true);
      setPage('home');
    }
  }

  useEffect(() => {
    if (page === 'analytics') {
      api<any>('/analytics/overview')
        .then(setAnalytics)
        .catch(() =>
          setAnalytics({
            data: {
              totalSessions: 128,
              sessionConversionRate: 0.187,
              actionsPerSession: 2.4,
              timeToFirstAction: 18,
              finalStepConversion: 0.64,
              sessionsPerUser: 3.2
            }
          })
        );
    }
  }, [page]);

  async function event(eventType: string, metadata: Record<string, unknown> = {}, contentId?: string) {
    if (!sessionId) return;
    try {
      const r: any = await api('/events', {
        method: 'POST',
        body: JSON.stringify({ sessionId, eventType, metadata, contentId })
      });
      setIntent(r.data.intent);
      const rr: any = await api(`/recommendations/${sessionId}`);
      setRecs(rr.data);
    } catch {
      if (eventType === 'SEARCH' && String(metadata.query).toLowerCase().includes('football')) {
        setIntent({
          intent: 'FOOTBALL_DISCOVERY',
          category: 'Football',
          timeContext: 'Tonight / upcoming',
          confidence: 0.9,
          signals: ['football_search', 'multiple_football_views']
        });
      }
    }
  }

  function search(value: string) {
    setQuery(value);
    if (value.trim()) event('SEARCH', { query: value });
  }

  function open(item: Content) {
    setDetail(item);
    event('CONTENT_VIEWED', { category: item.category }, item.id);
  }

  async function complete() {
    await event('ACTION_STARTED', { action: 'save_session' }, detail?.id);
    await event('ACTION_COMPLETED', { action: 'save_session' }, detail?.id);
    setCompleted(true);
    setDetail(null);
  }

  const top = recs.length
    ? recs
    : items.slice(0, 4).map(content => ({
        content,
        score: 0.5,
        reasons: ['Popular in your discovery feed']
      }));

  const showSessionInsight = intent.intent !== 'GENERAL_DISCOVERY' && sessionMode === 'intelligent';

  if (page === 'demo-select') {
    return (
      <div className="shell">
        <Header currentPage={page} onPageChange={setPage} />
        <main className="content" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <span className="eyebrow">SessionIQ Demo Mode</span>
          <h1 className="heading">Choose your experience</h1>
          <p className="subheading">
            Compare the control experience (generic recommendations) with Session Intelligence
            (context-aware recommendations).
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px' }}>
            <div className="demo-option" style={{ flex: 1, maxWidth: '400px' }}>
              <h3>Control Mode</h3>
              <p>Generic browsing experience with static recommendations.</p>
              <ul style={{ textAlign: 'left', margin: '24px 0' }}>
                <li>No session intent detection</li>
                <li>Static content ordering</li>
                <li>No contextual guidance</li>
              </ul>
              <button className="cta" onClick={() => start('control')}>
                Start Control Demo
              </button>
            </div>
            <div
              className="demo-option featured"
              style={{ flex: 1, maxWidth: '400px', border: '2px solid #64e6b1', borderRadius: '12px', padding: '24px' }}
            >
              <h3>Session Intelligence</h3>
              <p>Context-aware recommendations based on your session behavior.</p>
              <ul style={{ textAlign: 'left', margin: '24px 0' }}>
                <li>Real-time intent detection</li>
                <li>Dynamic content ranking</li>
                <li>Contextual Session Insight</li>
              </ul>
              <button className="cta" onClick={() => start('intelligent')}>
                Start Intelligent Demo
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <Header currentPage={page} onPageChange={setPage} />
      {page === 'analytics' ? (
        <AnalyticsDashboard data={analytics} />
      ) : (
        <main className="content">
          {detail ? (
            <ContentDetail content={detail} onBack={() => setDetail(null)} onComplete={complete} completed={completed} />
          ) : (
            <>
              <div className="hero">
                <div>
                  <span className="eyebrow">
                    Session intelligence · {sessionMode === 'control' ? 'Control Mode' : 'Personal workspace'}
                  </span>
                  <h1 className="heading">Make this session<br/>useful to you.</h1>
                  <p className="subheading">
                    {sessionMode === 'control'
                      ? 'A generic browsing experience with static recommendations.'
                      : 'A calmer way to discover relevant content. SessionIQ learns from what you do right now, then explains why something is being surfaced.'}
                  </p>
                </div>
                <div className="session-box">
                  <small>Current session</small>
                  <div className="session-line">
                    <span>
                      <i className="dot" /> {started ? 'Active' : 'Starting'}
                    </span>
                    <span>
                      {intent.intent === 'GENERAL_DISCOVERY'
                        ? 'Browsing'
                        : intent.intent.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                    Mode: {sessionMode === 'control' ? 'Control' : 'Intelligent'}
                  </div>
                </div>
              </div>

              <div className="toolbar">
                <input
                  aria-label="Search content"
                  className="search"
                  value={query}
                  onChange={e => search(e.target.value)}
                  placeholder="Search (try 'football tonight')"
                />
                <div className="filters">
                  {['All', 'Football', 'Basketball', 'Tennis', 'Live'].map(cat => (
                    <button
                      key={cat}
                      className={category === cat ? 'active' : ''}
                      onClick={() => {
                        setCategory(cat);
                        if (cat !== 'All') event('FILTER_USED', { category: cat });
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {showSessionInsight && (
                <SessionInsight
                  intent={intent}
                  onExplore={() => {
                    const firstRec = top[0];
                    if (firstRec) open(firstRec.content);
                  }}
                  visible={showSessionInsight}
                />
              )}

              <section className="section">
                <div className="section-header">
                  <h2>
                    {sessionMode === 'control'
                      ? 'Popular content'
                      : 'Recommended for this session'}
                  </h2>
                  {sessionMode === 'intelligent' && intent.intent !== 'GENERAL_DISCOVERY' && (
                    <p className="section-sub">
                      Based on your recent activity:
                      {intent.signals.slice(0, 2).map((s, i) => (
                        <span key={i} style={{ marginLeft: '8px' }}>
                          • {s.replace('_', ' ')}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <div className="grid">
                  {top.map((rec, i) => (
                    <ContentCard key={i} item={rec.content} onOpen={open} recommendation={rec} />
                  ))}
                </div>
              </section>

              <section className="section">
                <h2>All content</h2>
                <div className="grid">
                  {filtered.map(item => (
                    <ContentCard key={item.id} item={item} onOpen={open} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}

function Analytics({ data }: { data: any }) {
  const d = data?.data || {
    totalSessions: 128,
    sessionConversionRate: 0.187,
    actionsPerSession: 2.4,
    timeToFirstAction: 18,
    finalStepConversion: 0.64,
    sessionsPerUser: 3.2
  };
  return (
    <main className="content">
      <span className="eyebrow">Measure what matters</span>
      <h1 className="heading">Session quality,<br/>made visible.</h1>
      <p className="subheading">
        These indicators help us improve relevance and convenience without treating more activity as the goal.
      </p>
      <div className="analytics-grid">
        {[
          ['Total sessions', d.totalSessions],
          ['Conversion rate', `${(d.sessionConversionRate * 100).toFixed(1)}%`],
          ['Actions / session', d.actionsPerSession.toFixed?.(1) || d.actionsPerSession],
          ['Time to first action', `${Math.round(d.timeToFirstAction)} sec`],
          ['Final-step conversion', `${(d.finalStepConversion * 100).toFixed(0)}%`],
          ['Sessions / user', d.sessionsPerUser.toFixed?.(1) || d.sessionsPerUser]
        ].map(([a, b]) => (
          <div className="metric" key={String(a)}>
            <span>{a}</span>
            <strong>{b}</strong>
            <em>↗ demo indicator</em>
          </div>
        ))}
      </div>
      <div className="panel">
        <span className="notice">CONTROL VS SESSION INTELLIGENCE · SIMULATED DEMO VALUES</span>
        <h2 style={{ marginTop: 17 }}>A more relevant session should feel faster, not louder.</h2>
        <p>Illustrative comparison for the hackathon narrative. These are not production results or an experiment.</p>
        <div className="compare">
          <Compare title="Control" values={['31 sec', '1.5', '12.4%']} bars={[62, 38, 42]} />
          <Compare title="Session Intelligence" values={['18 sec', '2.4', '18.7%']} bars={[36, 60, 63]} featured />
        </div>
      </div>
      <div className="panel">
        <h2>What the engine understood</h2>
        <p>Signals are structured, inspectable inputs—not a black-box profile.</p>
        <div className="reasons">
          <span className="reason">football_search</span>
          <span className="reason">multiple_football_views</span>
          <span className="reason">time_preference</span>
          <span className="reason">user-controlled action</span>
        </div>
      </div>
    </main>
  );
}

function Compare({ title, values, bars, featured = false }: { title: string; values: string[]; bars: number[]; featured?: boolean }) {
  return (
    <div className={`compare-col ${featured ? 'featured' : ''}`}>
      <h3>{title}</h3>
      {['Time to first action', 'Actions / session', 'Conversion rate'].map((x, i) => (
        <div className="bar-row" key={x}>
          <span>{x}</span>
          <div className="bar">
            <div className="fill" style={{ width: `${bars[i]}%` }} />
          </div>
          <b>{values[i]}</b>
        </div>
      ))}
    </div>
  );
}
