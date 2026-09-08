import { useState, useEffect } from 'react';
import { Recommendation } from '../types';
import { api } from '../lib/api';

export function useRecommendations(sessionId: string) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRecommendations() {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const r: any = await api(`/recommendations/${sessionId}`);
      setRecommendations(r.data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecommendations();
  }, [sessionId]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
}
