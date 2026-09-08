import { Friction } from '../types';

interface FrictionAlertProps {
  friction: Friction;
  onDismiss?: () => void;
}

export function FrictionAlert({ friction, onDismiss }: FrictionAlertProps) {
  if (!friction.detected) return null;

  const severityColors = {
    low: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200',
    medium: 'bg-orange-500/20 border-orange-500/50 text-orange-200',
    high: 'bg-red-500/20 border-red-500/50 text-red-200'
  };

  const severityIcons = {
    low: '⚠️',
    medium: '🔶',
    high: '🚨'
  };

  return (
    <div className={`px-4 py-3 rounded-xl border backdrop-blur-sm ${severityColors[friction.severity]} animate-pulse`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{severityIcons[friction.severity]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{friction.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
