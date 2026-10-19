export type Settings={lines:number;includeTitle:boolean;bg:string;bgImage?:string;font:string;fontSize:number;color:string;align:'left'|'center'|'right';position:'center'|'lower'};
export type Slide={id:string;text:string;title?:boolean};
export type Version={id:string;created:number;label:string;slides:Slide[];settings:Settings};
export type Project={id:string;title:string;lyrics:string;updated:number;settings:Settings;slides:Slide[];versions:Version[]};
const DB='prescreator-local-v1',STORE='projects';
const open=()=>new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function run<T>(mode:IDBTransactionMode,fn:(store:IDBObjectStore,resolve:(value:T)=>void,reject:(reason?:unknown)=>void)=>void){const db=await open();return new Promise<T>((resolve,reject)=>{const tx=db.transaction(STORE,mode);fn(tx.objectStore(STORE),resolve,reject);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)})}
export const getProjects=()=>run<Project[]>('readonly',(s,ok,no)=>{const r=s.getAll();r.onsuccess=()=>ok(r.result.sort((a,b)=>b.updated-a.updated));r.onerror=()=>no(r.error)});
export const saveProject=(p:Project)=>run<void>('readwrite',(s,ok,no)=>{const r=s.put(p);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)});
export const removeProject=(id:string)=>run<void>('readwrite',(s,ok,no)=>{const r=s.delete(id);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)});
export const defaults:Settings={lines:2,includeTitle:true,bg:'navy',font:'Arial, sans-serif',fontSize:48,color:'#ffffff',align:'center',position:'center'};
export const newProject=():Project=>({id:crypto.randomUUID(),title:'Untitled worship song',lyrics:'',updated:Date.now(),settings:{...defaults},slides:[],versions:[]});
export const splitLyrics=(lyrics:string,settings:Settings,title:string):Slide[]=>{const lines=lyrics.replace(/\r/g,'').split('\n').map(l=>l.trim()).filter(Boolean);const slides:Slide[]=settings.includeTitle?[{id:crypto.randomUUID(),text:title,title:true}]:[];for(let i=0;i<lines.length;i+=settings.lines)slides.push({id:crypto.randomUUID(),text:lines.slice(i,i+settings.lines).join('\n')});return slides};
