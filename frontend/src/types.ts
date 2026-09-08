export type Content={id:string;title:string;category:string;startTime:string;tags:string[];popularity:number;status:'Live'|'Upcoming';venue:string;description:string;accent:string};
export type Intent={intent:string;category?:string;timeContext?:string;confidence:number;signals:string[]};
export type Recommendation={content:Content;score:number;reasons:string[]};
