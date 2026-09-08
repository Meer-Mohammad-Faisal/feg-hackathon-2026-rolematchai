import { Intent } from '../types';

interface SessionInsightProps {
  intent: Intent;
  onExplore: () => void;
  visible: boolean;
}

export default function SessionInsight({ intent, onExplore, visible }: SessionInsightProps) {
  if (!visible) return null;

  return (
    <div className="session-insight">
      <div className="insight-header">
        <span className="insight-label">Session Insight</span>
      </div>
      <p className="insight-message">
        {intent.intent === 'GENERAL_DISCOVERY'
          ? 'You are browsing content. Explore more to get personalized recommendations.'
          : `You have explored several ${intent.category?.toLowerCase() || 'content'} events during this session.`}
      </p>
      {intent.intent !== 'GENERAL_DISCOVERY' && (
        <p className="insight-submessage">
          We found relevant upcoming content based on your current activity.
        </p>
      )}
      <button className="insight-cta" onClick={onExplore}>
        Explore relevant content
      </button>
      {intent.signals.length > 0 && (
        <div className="insight-signals">
          <span className="signals-label">Signals detected:</span>
          {intent.signals.slice(0, 3).map((signal, i) => (
            <span className="signal-tag" key={i}>
              {signal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
