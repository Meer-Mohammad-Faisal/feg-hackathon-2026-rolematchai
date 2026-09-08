import { Intent, AdaptiveState, IntentRole, FrictionSignal } from '../types';

/**
 * Adaptive Experience Service
 * Dynamically changes the interface based on current session state
 * Implements responsible design by adapting to help users, not manipulate them
 */
export class AdaptiveExperienceService {
  private currentState: AdaptiveState = 'DISCOVERY';
  private stateHistory: AdaptiveState[] = [];
  private lastStateChange: number = Date.now();

  /**
   * Determine the optimal adaptive state based on intent and context
   */
  determineAdaptiveState(
    intent: Intent, 
    frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW',
    hasRecentActivity: boolean = true
  ): AdaptiveState {
    const previousState = this.currentState;
    let newState: AdaptiveState;

    // Priority 1: Handle high friction situations
    if (frictionLevel === 'HIGH') {
      newState = 'FOCUSED'; // Simplify interface to reduce cognitive load
    } 
    // Priority 2: Match intent role to adaptive state
    else if (intent.role === 'DECISION_READY') {
      newState = 'DECISION'; // Clear call-to-actions, streamlined interface
    } 
    else if (intent.role === 'COMPARATOR') {
      newState = 'COMPARISON'; // Side-by-side views, comparison tools
    } 
    else if (intent.role === 'RESEARCHER') {
      newState = 'RESEARCH'; // Detailed information, statistics, deep content
    } 
    else if (intent.role === 'EXPLORER') {
      newState = 'DISCOVERY'; // Broad exploration, recommendations, categories
    } 
    else {
      newState = 'DISCOVERY'; // Default for BROWSER role
    }

    // Only log state changes
    if (newState !== previousState) {
      this.stateHistory.push(previousState);
      this.lastStateChange = Date.now();
      this.currentState = newState;
    }

    return newState;
  }

  /**
   * Get UI configuration for the current adaptive state
   */
  getUIConfiguration(state: AdaptiveState): {
    layout: string;
    features: string[];
    messaging: string;
    contentDensity: 'low' | 'medium' | 'high';
  } {
    const configurations = {
      'DISCOVERY': {
        layout: 'grid-with-sidebar',
        features: ['recommendations', 'categories', 'search', 'trending'],
        messaging: 'Explore content and discover what interests you',
        contentDensity: 'medium'
      },
      'RESEARCH': {
        layout: 'detailed-view',
        features: ['detailed-info', 'statistics', 'related-content', 'bookmarks'],
        messaging: 'Deep dive into details and statistics',
        contentDensity: 'high'
      },
      'COMPARISON': {
        layout: 'side-by-side',
        features: ['comparison-tools', 'quick-view', 'similar-items', 'filters'],
        messaging: 'Compare options side by side',
        contentDensity: 'medium'
      },
      'DECISION': {
        layout: 'streamlined',
        features: ['clear-cta', 'essentials-only', 'confirmation', 'summary'],
        messaging: 'Ready to take action? Here\'s what you need',
        contentDensity: 'low'
      },
      'FOCUSED': {
        layout: 'simplified',
        features: ['essentials-only', 'guided-help', 'clear-options'],
        messaging: 'Let us help you find what you need',
        contentDensity: 'low'
      }
    };

    return configurations[state];
  }

  /**
   * Get adaptive recommendations based on current state
   */
  getAdaptiveRecommendations(state: AdaptiveState, baseRecommendations: any[]): any[] {
    switch (state) {
      case 'DISCOVERY':
        // Prioritize variety and exploration
        return baseRecommendations.slice(0, 8);
      
      case 'RESEARCH':
        // Prioritize detailed, content-rich items
        return baseRecommendations
          .filter(r => r.content.description.length > 50)
          .slice(0, 6);
      
      case 'COMPARISON':
        // Prioritize similar items for comparison
        return baseRecommendations.slice(0, 4); // Fewer, more comparable items
      
      case 'DECISION':
        // Prioritize clear, actionable items
        return baseRecommendations
          .filter(r => r.content.status === 'Upcoming' || r.content.status === 'Live')
          .slice(0, 3);
      
      case 'FOCUSED':
        // Very focused, top recommendations only
        return baseRecommendations.slice(0, 2);
      
      default:
        return baseRecommendations;
    }
  }

  /**
   * Get content display strategy based on adaptive state
   */
  getContentDisplayStrategy(state: AdaptiveState): {
    showThumbnails: boolean;
    showDescriptions: boolean;
    showMetadata: boolean;
    showComparison: boolean;
    itemSize: 'small' | 'medium' | 'large';
  } {
    const strategies = {
      'DISCOVERY': {
        showThumbnails: true,
        showDescriptions: true,
        showMetadata: true,
        showComparison: false,
        itemSize: 'medium'
      },
      'RESEARCH': {
        showThumbnails: true,
        showDescriptions: true,
        showMetadata: true,
        showComparison: false,
        itemSize: 'large'
      },
      'COMPARISON': {
        showThumbnails: true,
        showDescriptions: true,
        showMetadata: true,
        showComparison: true,
        itemSize: 'medium'
      },
      'DECISION': {
        showThumbnails: false,
        showDescriptions: true,
        showMetadata: false,
        showComparison: false,
        itemSize: 'small'
      },
      'FOCUSED': {
        showThumbnails: false,
        showDescriptions: true,
        showMetadata: false,
        showComparison: false,
        itemSize: 'medium'
      }
    };

    return strategies[state];
  }

  /**
   * Check if state transition is appropriate (prevent rapid flickering)
   */
  shouldTransitionState(newState: AdaptiveState): boolean {
    const timeSinceLastChange = Date.now() - this.lastStateChange;
    
    // Prevent rapid state changes (minimum 5 seconds between changes)
    if (timeSinceLastChange < 5000 && newState !== this.currentState) {
      return false;
    }

    // Prevent reverting to previous state too quickly
    if (this.stateHistory.length > 0) {
      const lastState = this.stateHistory[this.stateHistory.length - 1];
      if (newState === lastState && timeSinceLastChange < 15000) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get transition explanation for the user
   */
  getTransitionExplanation(from: AdaptiveState, to: AdaptiveState, intent: Intent): string {
    const explanations: Record<string, string> = {
      'DISCOVERY-RESEARCH': 'We noticed you\'re exploring in detail. Switching to research mode with more information.',
      'DISCOVERY-COMPARISON': 'You\'re comparing multiple items. Here\'s a side-by-side view to help.',
      'DISCOVERY-DECISION': 'You seem ready to decide. Streamlined view for quick action.',
      'RESEARCH-COMPARISON': 'Moving to comparison mode to help you evaluate options.',
      'RESEARCH-DECISION': 'Based on your research, here\'s the streamlined decision view.',
      'COMPARISON-DECISION': 'Ready to decide? Here\'s the simplified action view.',
      'ANY-FOCUSED': 'We simplified the interface to help you find what you need.',
      'FOCUSED-DISCOVERY': 'Back to exploration mode. Browse and discover freely.'
    };

    const key = `${from}-${to}`;
    return explanations[key] || `Switching to ${to.toLowerCase()} mode based on your activity.`;
  }

  /**
   * Get current state
   */
  getCurrentState(): AdaptiveState {
    return this.currentState;
  }

  /**
   * Reset state (for new sessions)
   */
  reset(): void {
    this.currentState = 'DISCOVERY';
    this.stateHistory = [];
    this.lastStateChange = Date.now();
  }

  /**
   * Get state history for analytics
   */
  getStateHistory(): AdaptiveState[] {
    return [...this.stateHistory];
  }
}

// Singleton instance for session tracking
export const adaptiveExperienceService = new AdaptiveExperienceService();