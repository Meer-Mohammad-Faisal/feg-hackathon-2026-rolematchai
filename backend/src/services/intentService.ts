import { Intent, SessionEvent } from '../types';
import { aiIntentService } from './aiIntentService';

export function detectIntent(events: SessionEvent[]): Intent {
  const searches = events.filter(e => e.eventType === 'SEARCH');
  const views = events.filter(e => e.eventType === 'CONTENT_VIEWED');
  const filters = events.filter(e => e.eventType === 'FILTER_USED');

  const text = [...searches, ...filters]
    .map(e => String(e.metadata.query ?? e.metadata.category ?? ''))
    .join(' ')
    .toLowerCase();

  const football = views.filter(e => String(e.metadata.category ?? '').toLowerCase() === 'football').length + (text.includes('football') ? 2 : 0);
  const basketball = views.filter(e => String(e.metadata.category ?? '').toLowerCase() === 'basketball').length + (text.includes('basketball') ? 2 : 0);
  const tennis = views.filter(e => String(e.metadata.category ?? '').toLowerCase() === 'tennis').length + (text.includes('tennis') ? 2 : 0);
  const upcoming = text.includes('tonight') || text.includes('upcoming') || text.includes('weekend');

  const signals: string[] = [];

  if (text.includes('football')) signals.push('football_search');
  if (football >= 3) signals.push('multiple_football_views');
  if (filters.some(e => String(e.metadata.category).toLowerCase() === 'football')) signals.push('football_filter');

  if (text.includes('basketball')) signals.push('basketball_search');
  if (basketball >= 3) signals.push('multiple_basketball_views');
  if (filters.some(e => String(e.metadata.category).toLowerCase() === 'basketball')) signals.push('basketball_filter');

  if (text.includes('tennis')) signals.push('tennis_search');
  if (tennis >= 3) signals.push('multiple_tennis_views');
  if (filters.some(e => String(e.metadata.category).toLowerCase() === 'tennis')) signals.push('tennis_filter');

  if (upcoming) signals.push('time_preference');

  if (football >= 3) {
    return {
      intent: 'FOOTBALL_DISCOVERY',
      category: 'Football',
      timeContext: upcoming ? 'Tonight / upcoming' : undefined,
      confidence: Math.min(0.98, 0.7 + football * 0.04),
      signals
    };
  }

  if (basketball >= 3) {
    return {
      intent: 'BASKETBALL_DISCOVERY',
      category: 'Basketball',
      timeContext: upcoming ? 'Tonight / upcoming' : undefined,
      confidence: Math.min(0.98, 0.7 + basketball * 0.04),
      signals
    };
  }

  if (tennis >= 3) {
    return {
      intent: 'TENNIS_DISCOVERY',
      category: 'Tennis',
      timeContext: upcoming ? 'Tonight / upcoming' : undefined,
      confidence: Math.min(0.98, 0.7 + tennis * 0.04),
      signals
    };
  }

  if (upcoming) {
    return {
      intent: 'UPCOMING_DISCOVERY',
      timeContext: 'Tonight / upcoming',
      confidence: 0.78,
      signals
    };
  }

  return {
    intent: 'GENERAL_DISCOVERY',
    confidence: 0.42,
    signals
  };
}

export async function detectIntentWithAI(events: SessionEvent[], query?: string): Promise<Intent> {
  // Try AI first if available and we have a query
  if (query && aiIntentService.isAvailable()) {
    try {
      const context = {
        events: events.slice(-5), // Last 5 events for context
        recentCategories: events.filter(e => e.eventType === 'CONTENT_VIEWED').map(e => e.metadata.category)
      };
      return await aiIntentService.parseIntent(query, context);
    } catch (error) {
      console.log('AI intent parsing failed, falling back to deterministic engine');
    }
  }

  // Always fall back to deterministic engine
  return detectIntent(events);
}
