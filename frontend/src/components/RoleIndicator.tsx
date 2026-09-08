import { SessionRole } from '../types';

interface RoleIndicatorProps {
  role: SessionRole;
}

const roleConfig: Record<SessionRole, { label: string; icon: string; color: string; description: string }> = {
  EXPLORER: {
    label: 'Explorer',
    icon: '🔍',
    color: 'bg-blue-500',
    description: 'Browsing and discovering content'
  },
  RESEARCHER: {
    label: 'Researcher',
    icon: '📊',
    color: 'bg-purple-500',
    description: 'Deep diving into specific topics'
  },
  COMPARATOR: {
    label: 'Comparator',
    icon: '⚖️',
    color: 'bg-amber-500',
    description: 'Comparing different options'
  },
  DECISION_READY: {
    label: 'Decision Ready',
    icon: '✅',
    color: 'bg-green-500',
    description: 'Ready to take action'
  }
};

export function RoleIndicator({ role }: RoleIndicatorProps) {
  const config = roleConfig[role];

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-xl shadow-lg`}>
        {config.icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{config.label}</div>
        <div className="text-xs text-white/70">{config.description}</div>
      </div>
    </div>
  );
}
