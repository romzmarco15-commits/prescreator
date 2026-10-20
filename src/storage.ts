export type SplitMode='continuous'|'verse-aware'|'keep-verse';
export type Settings={lines:number;maxLines:number;splitMode:SplitMode;includeTitle:boolean;bg:string;bgImage?:string;bgColor?:string;bgColor2?:string;gradientAngle?:number;font:string;fontSize:number;color:string;align:'left'|'center'|'right';position:'center'|'lower'};
export type Slide={id:string;text:string;title?:boolean;layout?:'title'|'point'|'scripture'|'reflection'|'closing';notes?:string};
export type Version={id:string;created:number;label:string;slides:Slide[];settings:Settings};
export type OutlineCard={id:string;heading:string;detail:string;layout:'point'|'scripture'|'reflection'|'closing';notes:string};
export type Project={id:string;title:string;lyrics:string;updated:number;settings:Settings;slides:Slide[];versions:Version[];kind?:'worship'|'teaching';scripture?:string;audience?:string;teachingNotes?:string;teachingSlides?:number;outlineCards?:OutlineCard[]};
const DB='prescreator-local-v1',STORE='projects';
const open=()=>new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function run<T>(mode:IDBTransactionMode,fn:(store:IDBObjectStore,resolve:(value:T)=>void,reject:(reason?:unknown)=>void)=>void){const db=await open();return new Promise<T>((resolve,reject)=>{const tx=db.transaction(STORE,mode);fn(tx.objectStore(STORE),resolve,reject);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)})}
export const getProjects=()=>run<Project[]>('readonly',(s,ok,no)=>{const r=s.getAll();r.onsuccess=()=>ok(r.result.sort((a,b)=>b.updated-a.updated));r.onerror=()=>no(r.error)});
export const saveProject=(p:Project)=>run<void>('readwrite',(s,ok,no)=>{const r=s.put(p);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)});
export const removeProject=(id:string)=>run<void>('readwrite',(s,ok,no)=>{const r=s.delete(id);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)});
export const defaults:Settings={lines:2,maxLines:3,splitMode:'verse-aware',includeTitle:true,bg:'navy',bgColor:'#202b48',bgColor2:'#7449a2',gradientAngle:135,font:'Arial, sans-serif',fontSize:48,color:'#ffffff',align:'center',position:'center'};
export const newProject=():Project=>({id:crypto.randomUUID(),title:'Untitled worship song',lyrics:'',updated:Date.now(),settings:{...defaults},slides:[],versions:[]});
const normalize=(lyrics:string)=>lyrics.replace(//g,'').split('
').map(l=>l.trim());
const sections=(lyrics:string)=>{const out:string[][]=[];let cur:string[]=[];for(const raw of normalize(lyrics)){if(!raw){if(cur.length)out.push(cur),cur=[];continue;}cur.push(raw);}if(cur.length)out.push(cur);return out;};
const fixedChunks=(rows:string[],size:number)=>{const out:string[][]=[];for(let i=0;i<rows.length;i+=size)out.push(rows.slice(i,i+size));return out;};
const balancedChunks=(rows:string[],preferred:number,maxLines:number)=>{const n=rows.length,max=Math.max(preferred,maxLines||preferred);if(n<=preferred)return [rows];if(n<=max)return [rows];const slides=Math.max(2,Math.ceil(n/max));const base=Math.floor(n/slides),extra=n%slides,sizes:number[]=[];for(let i=0;i<slides;i++)sizes.push(base+(i<extra?1:0));const out:string[][]=[];let at=0;for(const size of sizes){out.push(rows.slice(at,at+size));at+=size;}return out;};
export const splitLyrics=(lyrics:string,settings:Settings,title:string):Slide[]=>{const preferred=Math.max(1,Math.min(10,Number(settings.lines)||2));const maximum=Math.max(preferred,Math.min(10,Number(settings.maxLines)||preferred));const mode=(settings.splitMode||'continuous') as SplitMode;const slides:Slide[]=settings.includeTitle?[{id:crypto.randomUUID(),text:title,title:true}]:[];
 if(mode==='continuous'){
  const rows=normalize(lyrics).filter(Boolean);
  for(const chunk of fixedChunks(rows,preferred))slides.push({id:crypto.randomUUID(),text:chunk.join('
')});
  return slides;
 }
 for(const section of sections(lyrics)){
  const planned=mode==='keep-verse'?[section]:balancedChunks(section,preferred,maximum);
  for(const chunk of planned)slides.push({id:crypto.randomUUID(),text:chunk.join('
')});
 }
 return slides
};

// Older projects used one "heading | detail" per line. Convert them on first edit.
export function getOutlineCards(p:Project):OutlineCard[]{
 if(p.outlineCards)return p.outlineCards;
 return p.lyrics.split(/?
/).map(s=>s.trim()).filter(Boolean).map(line=>{
  const parts=line.split('|').map(s=>s.trim()),heading=parts[0]||'Teaching point';
  const layout=/^(verse|scripture|bible passage|reading)\s*:/i.test(heading)?'scripture':/^(reflection|discussion|application|question)\s*:/i.test(heading)?'reflection':/^(closing|prayer|conclusion)\s*:/i.test(heading)?'closing':'point';
  return {id:crypto.randomUUID(),heading,detail:parts.slice(1).join(' | '),layout:layout as OutlineCard['layout'],notes:''};
 });
}
export function serializeOutline(cards:OutlineCard[]):string {return cards.map(c=>`${c.heading.trim()}${c.detail.trim()?' | '+c.detail.trim():''}`).join('
');}
// One card becomes one slide, with separate local speaker notes.
export function teachingSlides(p:Project):Slide[]{
 const cards=getOutlineCards(p).filter(c=>c.heading.trim()||c.detail.trim()),slides:Slide[]=[];
 if(p.settings.includeTitle)slides.push({id:crypto.randomUUID(),text:p.title+(p.scripture?'
'+p.scripture:''),title:true,layout:'title',notes:p.teachingNotes||''});
 for(const card of cards){slides.push({id:crypto.randomUUID(),text:card.heading.trim()+(card.detail.trim()?'
'+card.detail.trim():''),layout:card.layout,notes:card.notes});}
 if(!cards.length)slides.push({id:crypto.randomUUID(),text:'Introduction
Add your first teaching point',layout:'point'});
 return slides;
}
