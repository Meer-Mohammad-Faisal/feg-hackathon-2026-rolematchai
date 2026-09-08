export type Content={id:string;title:string;category:string;startTime:string;tags:string[];popularity:number;status:'Live'|'Upcoming';venue:string;description:string;accent:string};
export type SessionRole='EXPLORER'|'RESEARCHER'|'COMPARATOR'|'DECISION_READY';
export type Intent={intent:string;category?:string;timeContext?:string;confidence:number;signals:string[];role:SessionRole};
export type Friction={detected:boolean;type:'navigation_loop'|'repeated_search'|'filter_confusion'|null;severity:'low'|'medium'|'high';message:string};
export type Recommendation={content:Content;score:number;reasons:string[];explanation:string};
