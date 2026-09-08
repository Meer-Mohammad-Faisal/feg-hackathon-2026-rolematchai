import { Content, Recommendation } from '../types';

interface ContentCardProps {
  item: Content;
  onOpen: (item: Content) => void;
  recommendation?: Recommendation;
}

export default function ContentCard({ item, onOpen, recommendation }: ContentCardProps) {
  return (
    <article className="card">
      <div className="card-top">
        <span className="category">{item.category}</span>
        <span className={`status ${item.status === 'Live' ? 'live' : ''}`}>
          {item.status}
        </span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {recommendation && (
        <div className="reasons">
          {recommendation.reasons.slice(0, 2).map((reason, i) => (
            <span className="reason" key={i}>
              {reason}
            </span>
          ))}
        </div>
      )}
      <div className="card-bottom">
        <span className="time">
          {item.startTime} · {item.venue}
        </span>
        <button className="cta" onClick={() => onOpen(item)}>
          Explore
        </button>
      </div>
    </article>
  );
}
