import { Content, Intent, Recommendation, SessionEvent } from '../types';

export function recommend(items: Content[], intent: Intent, events: SessionEvent[]): Recommendation[] {
  const viewed = new Set(events.filter(e => e.eventType === 'CONTENT_VIEWED').map(e => e.contentId));
  
  return items
    .filter(c => !viewed.has(c.id))
    .map(c => {
      const interest = intent.category && c.category === intent.category ? 1 : 0;
      const context = intent.timeContext && ((intent.timeContext.includes('Tonight') && c.startTime === 'Tonight') || c.status === 'Upcoming') ? 1 : 0;
      const recency = c.status === 'Live' ? 0.8 : 0.65;
      
      const score = Math.min(1, 
        0.35 * interest + 
        0.25 * (intent.intent !== 'GENERAL_DISCOVERY' && interest ? 1 : 0.2) + 
        0.2 * recency + 
        0.1 * context + 
        0.1 * c.popularity / 100
      );
      
      const reasons: string[] = [];
      if (interest) reasons.push(`Matches your ${c.category.toLowerCase()} interest`);
      if (context) reasons.push('Fits your timing preference');
      if (!reasons.length) reasons.push('Popular in your discovery feed');
      reasons.push('Not recently viewed');
      
      // Generate detailed explanation based on role
      const explanation = generateExplanation(intent, c, reasons, events);
      
      return {
        content: c,
        score: Number(score.toFixed(2)),
        reasons,
        explanation
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function generateExplanation(intent: Intent, content: Content, reasons: string[], events: SessionEvent[]): string {
  const roleLabels: Record<string, string> = {
    EXPLORER: 'exploring',
    RESEARCHER: 'researching',
    COMPARATOR: 'comparing options',
    DECISION_READY: 'ready to decide'
  };
  
  const roleLabel = roleLabels[intent.role] || 'browsing';
  
  let explanation = `You're seeing this because you're ${roleLabel}`;
  
  if (intent.category && intent.category === content.category) {
    explanation += ` and have shown interest in ${intent.category.toLowerCase()}`;
  }
  
  const views = events.filter(e => e.eventType === 'CONTENT_VIEWED' && e.metadata.category === content.category).length;
  if (views > 0) {
    explanation += `. You've viewed ${views} ${intent.category?.toLowerCase() || content.category.toLowerCase()} item${views > 1 ? 's' : ''}`;
  }
  
  if (intent.timeContext && content.startTime === 'Tonight') {
    explanation += ' and prefer events happening tonight';
  }
  
  explanation += '. ';
  
  if (reasons.length > 0) {
    explanation += reasons.slice(0, 2).join(', ') + '.';
  }
  
  return explanation;
}
