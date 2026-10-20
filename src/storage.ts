export type SplitMode='continuous'|'verse-aware'|'keep-verse';
export type Settings={lines:number;maxLines?:number;splitMode?:SplitMode;includeTitle:boolean;bg:string;bgImage?:string;bgColor?:string;bgColor2?:string;gradientAngle?:number;font:string;fontSize:number;color:string;align:'left'|'center'|'right';position:'center'|'lower'};
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
function songSections(lyrics:string):string[][] {
 const groups:string[][]=[];
 let group:string[]=[];
 for(const raw of lyrics.replace(/\r/g,'').split('\n')){
  const row=raw.trim();
  if(!row){if(group.length){groups.push(group);group=[];}continue;}
  group.push(row);
 }
 if(group.length)groups.push(group);
 return groups;
}
function groupSection(lines:string[],maximum:number):string[][] {
 if(lines.length<=maximum)return [lines];
 const count=Math.ceil(lines.length/maximum);
 const base=Math.floor(lines.length/count),remainder=lines.length%count;
 const result:string[][]=[];
 let start=0;
 for(let i=0;i<count;i++){
  const end=start+base+(i<remainder?1:0);
  result.push(lines.slice(start,end));start=end;
 }
 return result;
}
export const splitLyrics=(lyrics:string,settings:Settings,title:string):Slide[]=>{
 const preferred=Math.max(1,Math.min(10,Number(settings.lines)||2));
 const maximum=Math.max(preferred,Math.min(10,Number(settings.maxLines)||preferred));
 const mode=settings.splitMode||'verse-aware';
 const result:Slide[]=settings.includeTitle?[{id:crypto.randomUUID(),text:title,title:true}]:[];
 const push=(chunk:string[])=>result.push({id:crypto.randomUUID(),text:chunk.join('\n')});
 if(mode==='continuous'){
  const lines= songSections(lyrics).flat();
  for(let i=0;i<lines.length;i+=preferred)push(lines.slice(i,i+preferred));
 }else{
  for(const group of songSections(lyrics)){
   const chunks=mode==='keep-verse'?[group]:groupSection(group,maximum);
   chunks.forEach(push);
  }
 }
 return result;
};

// Older projects used one "heading | detail" per line. Convert them on first edit.
export function getOutlineCards(p:Project):OutlineCard[]{
 if(p.outlineCards)return p.outlineCards;
 return p.lyrics.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(line=>{
  const parts=line.split('|').map(s=>s.trim()),heading=parts[0]||'Teaching point';
  const layout=/^(verse|scripture|bible passage|reading)\s*:/i.test(heading)?'scripture':/^(reflection|discussion|application|question)\s*:/i.test(heading)?'reflection':/^(closing|prayer|conclusion)\s*:/i.test(heading)?'closing':'point';
  return {id:crypto.randomUUID(),heading,detail:parts.slice(1).join(' | '),layout:layout as OutlineCard['layout'],notes:''};
 });
}
export function serializeOutline(cards:OutlineCard[]):string {return cards.map(c=>`${c.heading.trim()}${c.detail.trim()?' | '+c.detail.trim():''}`).join('\n');}
// One card becomes one slide, with separate local speaker notes.
export function teachingSlides(p:Project):Slide[]{
 const cards=getOutlineCards(p).filter(c=>c.heading.trim()||c.detail.trim()),slides:Slide[]=[];
 if(p.settings.includeTitle)slides.push({id:crypto.randomUUID(),text:p.title+(p.scripture?'\n'+p.scripture:''),title:true,layout:'title',notes:p.teachingNotes||''});
 for(const card of cards){slides.push({id:crypto.randomUUID(),text:card.heading.trim()+(card.detail.trim()?'\n'+card.detail.trim():''),layout:card.layout,notes:card.notes});}
 if(!cards.length)slides.push({id:crypto.randomUUID(),text:'Introduction\nAdd your first teaching point',layout:'point'});
 return slides;
}
