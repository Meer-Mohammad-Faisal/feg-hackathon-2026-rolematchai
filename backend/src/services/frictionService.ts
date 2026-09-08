import { SessionEvent, Friction } from '../types';

export function detectFriction(events: SessionEvent[]): Friction {
  if (events.length < 3) {
    return { detected: false, type: null, severity: 'low', message: '' };
  }

  // Detect navigation loops (repeated back-and-forth)
  const navigationEvents = events.filter(e => e.eventType === 'NAVIGATION_BACK' || e.eventType === 'CONTENT_VIEWED');
  const recentNavEvents = navigationEvents.slice(-10);
  
  let navigationLoopCount = 0;
  for (let i = 1; i < recentNavEvents.length; i++) {
    const prev = recentNavEvents[i - 1];
    const curr = recentNavEvents[i];
    if (prev.eventType === 'CONTENT_VIEWED' && curr.eventType === 'NAVIGATION_BACK') {
      navigationLoopCount++;
    }
  }

  if (navigationLoopCount >= 3) {
    return {
      detected: true,
      type: 'navigation_loop',
      severity: navigationLoopCount >= 5 ? 'high' : 'medium',
      message: 'You seem to be navigating back and forth. Would you like help narrowing down your options?'
    };
  }

  // Detect repeated searches
  const searchEvents = events.filter(e => e.eventType === 'SEARCH');
  const recentSearches = searchEvents.slice(-5);
  const uniqueQueries = new Set(recentSearches.map(e => String(e.metadata.query || '')));
  
  if (recentSearches.length >= 4 && uniqueQueries.size <= 2) {
    return {
      detected: true,
      type: 'repeated_search',
      severity: 'medium',
      message: 'You\'ve searched for similar terms a few times. Try adjusting your filters instead.'
    };
  }

  // Detect filter confusion (rapid filter changes)
  const filterEvents = events.filter(e => e.eventType === 'FILTER_USED');
  const recentFilters = filterEvents.slice(-6);
  
  if (recentFilters.length >= 5) {
    const filterCategories = new Set(recentFilters.map(e => String(e.metadata.category || '')));
    if (filterCategories.size >= 4) {
      return {
        detected: true,
        type: 'filter_confusion',
        severity: 'low',
        message: 'You\'re switching between categories quickly. Focus on one category to see better results.'
      };
    }
  }

  return { detected: false, type: null, severity: 'low', message: '' };
}
