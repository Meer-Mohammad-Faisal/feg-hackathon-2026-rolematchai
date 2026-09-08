import { SessionEvent, EngagementMetrics } from '../types';

/**
 * Responsible Engagement Safeguards Service
 * Implements responsible engagement patterns to prevent addiction while maintaining user value
 * Complies with FEG responsible gambling and user protection guidelines
 */
export class EngagementSafeguardsService {
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private activityCount: number = 0;
  private meaningfulActions: number = 0;
  private warningShown: boolean = false;
  private breakReminderShown: boolean = false;
  private sessionIntensityScore: number = 0;

  // Responsible engagement thresholds (configurable per regulatory requirements)
  private readonly BREAK_REMINDER_INTERVAL = 20 * 60 * 1000; // 20 minutes
  private readonly INTENSIVE_SESSION_THRESHOLD = 30 * 60 * 1000; // 30 minutes
  private readonly CONCERNING_SESSION_THRESHOLD = 45 * 60 * 1000; // 45 minutes
  private readonly HIGH_ACTIVITY_THRESHOLD = 30; // actions per 5 minutes
  private readonly IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  /**
   * Track session activity for engagement monitoring
   */
  trackActivity(event: SessionEvent): EngagementMetrics {
    const now = Date.now();
    this.lastActivityTime = now;
    this.activityCount++;

    // Count meaningful actions (searches, views, actions - not just navigation)
    if (['SEARCH', 'CONTENT_VIEWED', 'ACTION_STARTED', 'ACTION_COMPLETED'].includes(event.eventType)) {
      this.meaningfulActions++;
    }

    return this.calculateEngagementMetrics();
  }

  /**
   * Calculate current engagement metrics
   */
  calculateEngagementMetrics(): EngagementMetrics {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStartTime) / 1000; // seconds
    const sessionMinutes = sessionDuration / 60;

    // Calculate actions per minute (for last 5 minutes)
    const recentActivity = this.activityCount / Math.max(1, sessionMinutes);
    const actionsPerMinute = recentActivity;

    // Calculate focus score (higher = more purposeful engagement)
    const meaningfulRatio = this.meaningfulActions / Math.max(1, this.activityCount);
    const focusScore = Math.min(100, meaningfulRatio * 100);

    // Determine session health
    let sessionHealth: 'HEALTHY' | 'INTENSIVE' | 'CONCERNING' = 'HEALTHY';
    let breakReminderNeeded = false;

    if (sessionDuration > this.CONCERNING_SESSION_THRESHOLD) {
      sessionHealth = 'CONCERNING';
      breakReminderNeeded = true;
    } else if (sessionDuration > this.INTENSIVE_SESSION_THRESHOLD) {
      sessionHealth = 'INTENSIVE';
      breakReminderNeeded = true;
    } else if (sessionDuration > this.BREAK_REMINDER_INTERVAL && !this.breakReminderShown) {
      breakReminderNeeded = true;
    }

    // Check for high-intensity activity patterns
    if (actionsPerMinute > this.HIGH_ACTIVITY_THRESHOLD) {
      sessionHealth = 'INTENSIVE';
    }

    return {
      sessionDuration: Math.round(sessionDuration),
      actionsPerMinute: Math.round(actionsPerMinute * 10) / 10,
      effectiveActions: this.meaningfulActions,
      focusScore: Math.round(focusScore),
      breakReminderNeeded,
      sessionHealth
    };
  }

  /**
   * Check if a break reminder should be shown
   * Returns the message if reminder is needed, null otherwise
   */
  shouldShowBreakReminder(): string | null {
    const metrics = this.calculateEngagementMetrics();
    
    if (!metrics.breakReminderNeeded) {
      return null;
    }

    if (this.breakReminderShown) {
      return null; // Already shown this session
    }

    this.breakReminderShown = true;

    // Craft appropriate message based on session health
    if (metrics.sessionHealth === 'CONCERNING') {
      return "You've been with us for a while. Consider taking a break and returning later.";
    } else if (metrics.sessionHealth === 'INTENSIVE') {
      return "Taking a short break can help maintain perspective. Feel free to step away and come back refreshed.";
    } else {
      return "Quick reminder: it's healthy to take breaks. Your session will be here when you return.";
    }
  }

  /**
   * Check if activity is becoming concerning (responsible gambling safeguard)
   */
  isActivityConcerning(): { concerning: boolean; reason?: string } {
    const metrics = this.calculateEngagementMetrics();

    if (metrics.sessionHealth === 'CONCERNING') {
      return {
        concerning: true,
        reason: `Session duration exceeds ${Math.round(this.CONCERNING_SESSION_THRESHOLD / 60000)} minutes`
      };
    }

    if (metrics.actionsPerMinute > this.HIGH_ACTIVITY_THRESHOLD) {
      return {
        concerning: true,
        reason: 'High activity intensity detected'
      };
    }

    if (metrics.focusScore < 30 && metrics.sessionDuration > this.INTENSIVE_SESSION_THRESHOLD) {
      return {
        concerning: true,
        reason: 'Low focus score with extended session duration'
      };
    }

    return { concerning: false };
  }

  /**
   * Get responsible engagement suggestions
   */
  getEngagementSuggestions(): string[] {
    const metrics = this.calculateEngagementMetrics();
    const suggestions: string[] = [];

    if (metrics.sessionHealth === 'CONCERNING') {
      suggestions.push('Consider ending your session and returning later');
      suggestions.push('Take a longer break before continuing');
    } else if (metrics.sessionHealth === 'INTENSIVE') {
      suggestions.push('Take a short break to refresh');
      suggestions.push('Step away for a few minutes');
    }

    if (metrics.focusScore < 40) {
      suggestions.push('Try focusing on specific content rather than browsing');
      suggestions.push('Use search to find exactly what you need');
    }

    if (metrics.actionsPerMinute > this.HIGH_ACTIVITY_THRESHOLD) {
      suggestions.push('Slow down and process information thoughtfully');
      suggestions.push('Take time to consider each item');
    }

    return suggestions;
  }

  /**
   * Check if user has been idle (no activity for extended period)
   */
  isUserIdle(): boolean {
    const now = Date.now();
    return (now - this.lastActivityTime) > this.IDLE_TIMEOUT;
  }

  /**
   * Get session summary for responsible engagement reporting
   */
  getSessionSummary(): {
    duration: number;
    totalActions: number;
    meaningfulActions: number;
    healthStatus: string;
    breaksTaken: number;
  } {
    const metrics = this.calculateEngagementMetrics();
    
    return {
      duration: metrics.sessionDuration,
      totalActions: this.activityCount,
      meaningfulActions: this.meaningfulActions,
      healthStatus: metrics.sessionHealth,
      breaksTaken: this.breakReminderShown ? 1 : 0
    };
  }

  /**
   * Reset the service for a new session
   */
  reset(): void {
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.activityCount = 0;
    this.meaningfulActions = 0;
    this.warningShown = false;
    this.breakReminderShown = false;
    this.sessionIntensityScore = 0;
  }

  /**
   * Set custom thresholds (for testing or regulatory requirements)
   */
  setThresholds(thresholds: {
    breakReminderInterval?: number;
    intensiveSessionThreshold?: number;
    concerningSessionThreshold?: number;
    highActivityThreshold?: number;
  }): void {
    if (thresholds.breakReminderInterval) {
      this.BREAK_REMINDER_INTERVAL = thresholds.breakReminderInterval;
    }
    if (thresholds.intensiveSessionThreshold) {
      this.INTENSIVE_SESSION_THRESHOLD = thresholds.intensiveSessionThreshold;
    }
    if (thresholds.concerningSessionThreshold) {
      this.CONCERNING_SESSION_THRESHOLD = thresholds.concerningSessionThreshold;
    }
    if (thresholds.highActivityThreshold) {
      this.HIGH_ACTIVITY_THRESHOLD = thresholds.highActivityThreshold;
    }
  }
}

// Singleton instance for session tracking
export const engagementSafeguardsService = new EngagementSafeguardsService();