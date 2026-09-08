import { Session, SessionMetrics } from '../types';

export function analytics(list: Session[]): SessionMetrics {
  const total = list.length || 1;
  const completed = list.filter(s => s.events.some(e => e.eventType === 'ACTION_COMPLETED')).length;
  const actions = list.reduce((n, s) => n + s.events.filter(e => e.eventType === 'ACTION_COMPLETED').length, 0);
  
  // Time to First Action
  const times = list.flatMap(s => {
    const first = s.events.find(e => ['ACTION_STARTED', 'ACTION_COMPLETED'].includes(e.eventType));
    return first ? [Math.max(0, (new Date(first.createdAt).getTime() - new Date(s.startedAt).getTime()) / 1000)] : [];
  });
  
  const timeToFirstAction = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  
  // Final-step Conversion (actions started vs completed)
  const actionStarted = list.filter(s => s.events.some(e => e.eventType === 'ACTION_STARTED')).length;
  const finalStepConversion = actionStarted ? completed / actionStarted : 0;
  
  // Value per Session (actions completed per session)
  const valuePerSession = actions / total;
  
  // Sessions per User
  const sessionsPerUser = list.length / Math.max(1, new Set(list.map(s => s.userId)).size);
  
  return {
    totalSessions: list.length,
    sessionConversionRate: completed / total,
    actionsPerSession: actions / total,
    timeToFirstAction,
    finalStepConversion,
    valuePerSession,
    sessionsPerUser
  };
}
