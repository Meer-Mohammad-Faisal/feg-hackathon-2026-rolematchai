import { Content, Session, SessionEvent } from './types';

const entries = [
 ['Champions Under Lights','Football','19:30','Tonight · Stadium A'],['City Rivals Preview','Football','21:00','Tonight · Studio 2'],['Weekend Football Briefing','Football','Sat 10:00','Upcoming · Arena North'],['The Midfield Report','Football','Sat 14:00','Upcoming · Studio 1'],['Women’s Football Focus','Football','Sun 16:00','Upcoming · Stadium B'],['Basketball: Full Court Pulse','Basketball','20:00','Tonight · Court 4'],['Rising Hoops: Weekly Roundup','Basketball','Sat 12:30','Upcoming · Court 2'],['Tennis: Baseline Stories','Tennis','18:00','Tonight · Court 1'],['Grand Slam Roadmap','Tennis','Sun 11:00','Upcoming · Court 3'],['Live Court Watch','Live','Now','Live · Multi-court']
];
export const content:Content[] = Array.from({length:36},(_,i)=>{ const e=entries[i%entries.length]; const category=e[1]; return { id:`event_${String(i+1).padStart(3,'0')}`, title:i<10?e[0]:`${e[0]} · Session ${i+1}`, category, startTime:e[2], tags:[category.toLowerCase(), e[3].toLowerCase().split(' · ')[0]], popularity:72-(i%7)*5, status:e[2]==='Now'?'Live':'Upcoming', venue:e[3].split(' · ')[1], description:`A concise, informative ${category.toLowerCase()} session with the context you need to decide what is useful for you.`, accent:['#64e6b1','#7dd3fc','#c4b5fd','#fbbf7d'][i%4]}; });
export const sessions = new Map<string,Session>();
export const allEvents:SessionEvent[]=[];
export function findContent(id?:string){ return content.find(c=>c.id===id); }
