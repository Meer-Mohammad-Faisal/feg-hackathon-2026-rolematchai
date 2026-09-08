import { useState, useEffect } from 'react';
import { Intent } from '../types';
import { api } from '../lib/api';

export function useSession() {
  const [sessionId, setSessionId] = useState('');
  const [intent, setIntent] = useState<Intent>({ intent: 'GENERAL_DISCOVERY', confidence: 0.42, signals: [] });
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(mode: 'control' | 'intelligent' = 'intelligent') {
    setLoading(true);
    setError(null);
    try {
      const r: any = await api('/session/start', {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      setSessionId(r.data.id);
      setStarted(true);
    } catch (err) {
      console.error('Session start failed:', err);
      setError('Failed to start session. Using demo mode.');
      setSessionId(`demo_${Date.now()}`);
      setStarted(true);
    } finally {
      setLoading(false);
    }
  }

  async function trackEvent(eventType: string, metadata: Record<string, unknown> = {}, contentId?: string) {
    if (!sessionId) return;
    try {
      const r: any = await api('/events', {
        method: 'POST',
        body: JSON.stringify({ sessionId, eventType, metadata, contentId })
      });
      setIntent(r.data.intent);
    } catch (err) {
      console.error('Event tracking failed:', err);
      // Don't show error for event tracking failures - they're non-critical
    }
  }

  useEffect(() => {
    start();
  }, []);

  return { sessionId, intent, started, loading, error, trackEvent, start };
}
