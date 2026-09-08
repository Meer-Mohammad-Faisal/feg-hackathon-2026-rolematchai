import { Content, SessionRole } from '../types';

interface AdaptiveContentCardProps {
  content: Content;
  role: SessionRole;
  onClick: () => void;
}

export function AdaptiveContentCard({ content, role, onClick }: AdaptiveContentCardProps) {
  const showStats = role === 'RESEARCHER' || role === 'COMPARATOR';
  const showCompare = role === 'COMPARATOR';
  const showQuickAction = role === 'DECISION_READY';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/80">
            {content.category}
          </span>
          {content.status === 'Live' && (
            <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              LIVE
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
          {content.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
          <span className="flex items-center gap-1.5">
            <svg className="adaptive-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {content.startTime}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="adaptive-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {content.venue}
          </span>
        </div>

        {showStats && (
          <div className="flex items-center gap-3 mb-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <svg className="adaptive-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Popularity: {content.popularity}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <svg className="adaptive-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {content.tags.length} tags
            </div>
          </div>
        )}

        {showCompare && (
          <div className="flex items-center gap-2 mb-3 pt-3 border-t border-white/10">
            <button className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
              Compare
            </button>
          </div>
        )}

        {showQuickAction && (
          <button className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25">
            Save as useful next step
          </button>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
