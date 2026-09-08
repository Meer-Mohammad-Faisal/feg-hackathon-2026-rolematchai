export type EventType = 'SESSION_STARTED'|'SEARCH'|'CONTENT_VIEWED'|'FILTER_USED'|'RECOMMENDATION_SHOWN'|'RECOMMENDATION_CLICKED'|'ACTION_STARTED'|'ACTION_COMPLETED'|'SESSION_ENDED';
export type Content = { id:string; title:string; category:string; startTime:string; tags:string[]; popularity:number; status:'Live'|'Upcoming'; venue:string; description:string; accent:string };
export type SessionEvent = { id:string; sessionId:string; eventType:EventType; contentId?:string; metadata:Record<string,unknown>; createdAt:string };
export type Intent = { intent:string; category?:string; timeContext?:string; confidence:number; signals:string[] };
export type Recommendation = { content:Content; score:number; reasons:string[] };
export type Session = { id:string; userId:string; startedAt:string; endedAt?:string; mode:'control'|'intelligent'; events:SessionEvent[]; intent:Intent };
