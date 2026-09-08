import { Content } from '../types';

interface ContentDetailProps {
  content: Content | null;
  onBack: () => void;
  onComplete: () => void;
  completed: boolean;
}

export default function ContentDetail({ content, onBack, onComplete, completed }: ContentDetailProps) {
  if (!content) return null;

  return (
    <div className="detail">
      <button className="back" onClick={onBack}>
        ← Back to discovery
      </button>
      <div className="detail-hero">
        <span className="category">{content.category}</span>
        <h1>{content.title}</h1>
        <p>
          {content.description} This demo action keeps the user in control and does not create
          pressure to continue.
        </p>
        <div className="detail-meta">
          <span>◷ {content.startTime}</span>
          <span>⌖ {content.venue}</span>
          <span>◌ {content.status}</span>
        </div>
        <button className="action" onClick={onComplete}>
          {completed ? 'Action completed' : 'Save as a useful next step'}
        </button>
      </div>
      <p className="footer-note">
        SessionIQ records meaningful actions to understand session quality. You can leave at any
        time.
      </p>
    </div>
  );
}
