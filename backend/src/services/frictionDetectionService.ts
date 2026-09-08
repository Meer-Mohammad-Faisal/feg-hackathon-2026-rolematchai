import { SessionEvent, FrictionSignal, FrictionType, FrictionLevel } from '../types';

/**
 * Friction Detection Service
 * Identifies when users are struggling to find information or navigate
 * Implements responsible design by helping rather than exploiting frustration
 */
export class FrictionDetectionService {
  private eventHistory: SessionEvent[] = [];
  private frictionSignals: FrictionSignal[] = [];
  private lastNavigationTime: number = 0;
  private navigationCount: number = 0;
  private searchQueryHistory: string[] = [];
  private filterChangeCount: number = 0;
  private lastFilterChangeTime: number = 0;

  /**
   * Analyze new events for friction patterns
   */
  analyzeEvent(event: SessionEvent): FrictionSignal | null {
    this.eventHistory.push(event);
    const friction = this.detectFriction(event);
    
    if (friction) {
      this.frictionSignals.push(friction);
      return friction;
    }
    
    return null;
  }

  /**
   * Get all detected friction signals
   */
  getFrictionSignals(): FrictionSignal[] {
    return this.frictionSignals;
  }

  /**
   * Clear friction history (useful for session reset)
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.frictionSignals = [];
    this.lastNavigationTime = 0;
    this.navigationCount = 0;
    this.searchQueryHistory = [];
    this.filterChangeCount = 0;
    this.lastFilterChangeTime = 0;
  }

  /**
   * Detect friction patterns based on event type and context
   */
  private detectFriction(event: SessionEvent): FrictionSignal | null {
    const now = Date.now();
    
    switch (event.eventType) {
      case 'SEARCH':
        return this.detectSearchFriction(event, now);
      case 'FILTER_USED':
        return this.detectFilterFriction(event, now);
      case 'CONTENT_VIEWED':
        return this.detectContentAbandonment(event, now);
      default:
        return this.detectRapidNavigation(event, now);
    }
  }

  /**
   * Detect friction from repeated searches
   */
  private detectSearchFriction(event: SessionEvent, now: number): FrictionSignal | null {
    const query = String(event.metadata.query || '').toLowerCase().trim();
    
    if (!query) {
      return this.createFrictionSignal('EMPTY_QUERIES', 'LOW', 
        'Empty search query detected - user may be uncertain what to look for');
    }

    // Check for repeated similar queries
    const recentSimilarSearches = this.searchQueryHistory.filter(q => 
      q.includes(query) || query.includes(q)
    );

    if (recentSimilarSearches.length >= 2) {
      return this.createFrictionSignal('REPEATED_SEARCHES', 'MEDIUM',
        `User repeated similar search queries (${recentSimilarSearches.length + 1} times) - may not be finding relevant results`);
    }

    this.searchQueryHistory.push(query);
    // Keep only last 5 searches
    if (this.searchQueryHistory.length > 5) {
      this.searchQueryHistory.shift();
    }

    return null;
  }

  /**
   * Detect friction from excessive filter changes
   */
  private detectFilterFriction(event: SessionEvent, now: number): FrictionSignal | null {
    this.filterChangeCount++;
    
    // Check for rapid filter changes (within 10 seconds)
    if (now - this.lastFilterChangeTime < 10000 && this.filterChangeCount >= 4) {
      const signal = this.createFrictionSignal('FILTER_TINKERING', 'MEDIUM',
        'Rapid filter changes detected - user may be struggling to narrow down results');
      this.filterChangeCount = 0; // Reset after detection
      return signal;
    }

    this.lastFilterChangeTime = now;
    return null;
  }

  /**
   * Detect friction from content abandonment patterns
   */
  private detectContentAbandonment(event: SessionEvent, now: number): FrictionSignal | null {
    // Check if user is quickly bouncing between content without meaningful interaction
    const recentViews = this.eventHistory
      .filter(e => e.eventType === 'CONTENT_VIEWED')
      .slice(-5);

    if (recentViews.length >= 3) {
      const timeBetweenViews = recentViews.map((e, i) => {
        if (i === 0) return 0;
        return new Date(e.createdAt).getTime() - new Date(recentViews[i - 1].createdAt).getTime();
      });

      // If average time between views is very short (< 3 seconds)
      const avgTime = timeBetweenViews.reduce((a, b) => a + b, 0) / timeBetweenViews.length;
      if (avgTime < 3000 && timeBetweenViews.every(t => t < 5000)) {
        return this.createFrictionSignal('CONTENT_ABANDONMENT', 'HIGH',
          'Rapid content browsing detected - user may not be finding what they need');
      }
    }

    return null;
  }

  /**
   * Detect friction from rapid navigation patterns
   */
  private detectRapidNavigation(event: SessionEvent, now: number): FrictionSignal | null {
    this.navigationCount++;
    
    // Check for very rapid navigation (multiple events within 2 seconds)
    if (now - this.lastNavigationTime < 2000 && this.navigationCount >= 6) {
      const signal = this.createFrictionSignal('RAPID_NAVIGATION', 'MEDIUM',
        'Rapid navigation detected - user may be frustrated or uncertain');
      this.navigationCount = 0; // Reset after detection
      return signal;
    }

    this.lastNavigationTime = now;
    return null;
  }

  /**
   * Create a friction signal with appropriate metadata
   */
  private createFrictionSignal(
    type: FrictionType, 
    level: FrictionLevel, 
    description: string
  ): FrictionSignal {
    return {
      type,
      level,
      description,
      timestamp: new Date().toISOString(),
      mitigated: false
    };
  }

  /**
   * Get suggested mitigations for detected friction
   */
  getMitigationSuggestions(friction: FrictionSignal): string[] {
    const suggestions: Record<FrictionType, string[]> = {
      'RAPID_NAVIGATION': [
        'Simplify the current view',
        'Provide a clear starting point',
        'Offer guided discovery options'
      ],
      'REPEATED_SEARCHES': [
        'Improve search result relevance',
        'Provide search suggestions',
        'Offer category browsing as alternative'
      ],
      'FILTER_TINKERING': [
        'Simplify filter options',
        'Provide preset combinations',
        'Show result count before applying'
      ],
      'CONTENT_ABANDONMENT': [
        'Improve content previews',
        'Provide more detailed descriptions',
        'Offer different sorting options'
      ],
      'EMPTY_QUERIES': [
        'Provide search suggestions',
        'Highlight popular content',
        'Offer guided exploration'
      ]
    };

    return suggestions[friction.type] || ['Improve overall discoverability'];
  }

  /**
   * Get overall friction level for the session
   */
  getSessionFrictionLevel(): FrictionLevel {
    if (this.frictionSignals.length === 0) return 'LOW';
    
    const highCount = this.frictionSignals.filter(f => f.level === 'HIGH').length;
    const mediumCount = this.frictionSignals.filter(f => f.level === 'MEDIUM').length;
    
    if (highCount >= 2 || mediumCount >= 4) return 'HIGH';
    if (highCount >= 1 || mediumCount >= 2) return 'MEDIUM';
    return 'LOW';
  }
}

// Singleton instance for session tracking
export const frictionDetectionService = new FrictionDetectionService();