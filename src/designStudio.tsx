import {useEffect,useRef,useState} from 'react';
import {Download,Save,Plus,ImagePlus,Trash2,RefreshCw,Copy,Check,Info,Sparkles,ExternalLink,Cloud,FolderOpen} from 'lucide-react';
import './designStudio.css';

type Output='title'|'section'|'announcement'|'poster'|'invite';
type Orientation='landscape'|'portrait'|'square';
type Theme={id:string;name:string;type:'gradient'|'solid'|'image';colors:[string,string];accent:string;foreground:string;font:string;layout:'center'|'left'|'frame';background?:string;source?:'native'|'canva'|'ai';canvaDesignId?:string;styleNotes?:string};
type Design={id:string;name:string;output:Output;orientation:Orientation;theme:Theme;title:string;subtitle:string;body:string;date:string;time:string;venue:string;address:string;footer:string;updated:number};
const defaultThemes:Theme[]=[
 {id:'cream',name:'Warm Minimalist',type:'gradient',colors:['#f9f4e9','#e3cfb3'],accent:'#876448',foreground:'#342d29',font:'Georgia, serif',layout:'center'},
 {id:'navy',name:'Elegant Navy',type:'gradient',colors:['#101b34','#34466d'],accent:'#d7bb84',foreground:'#ffffff',font:'Georgia, serif',layout:'center'},
 {id:'forest',name:'Forest Reflection',type:'gradient',colors:['#152e2a','#537668'],accent:'#dfd5b3',foreground:'#ffffff',font:'Georgia, serif',layout:'left'},
 {id:'violet',name:'Modern Worship',type:'gradient',colors:['#241a4e','#8451ac'],accent:'#e9bbff',foreground:'#ffffff',font:'Arial, sans-serif',layout:'center'},
 {id:'rose',name:'Soft Floral',type:'gradient',colors:['#f8e9e3','#ddb2b0'],accent:'#995962',foreground:'#3b2731',font:'Georgia, serif',layout:'frame'},
 {id:'youth',name:'Youth Energy',type:'gradient',colors:['#161335','#7541d8'],accent:'#adffbd',foreground:'#ffffff',font:'Arial Black, sans-serif',layout:'left'}
];
const newDesign=(theme=defaultThemes[0],output:Output='title'):Design=>({id:crypto.randomUUID(),name:'New design',output,orientation:output==='poster'||output==='invite'?'portrait':'landscape',theme:{...theme},title:output==='section'?'Praise and Worship':output==='announcement'?'Announcements':output==='poster'?'Sunday Service':output==='invite'?'You Are Invited':'Sunday Worship',subtitle:output==='title'?'Hope Filipino Axis':'',body:'',date:'',time:'',venue:'',address:'',footer:'',updated:Date.now()});
const dateText=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}):s;
const timeText=(s:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s)?new Date('2000-01-01T'+s+':00').toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}):s;
const THEME_DB='prescreator-themes-v1';
const openThemes=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(THEME_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('themes'))r.result.createObjectStore('themes',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function savedThemes():Promise<Theme[]>{const db=await openThemes();const rows=await new Promise<Theme[]>((resolve,reject)=>{const r=db.transaction('themes','readonly').objectStore('themes').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return rows;}
async function putTheme(t:Theme){const db=await openThemes();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('themes','readwrite');tx.objectStore('themes').put(t);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();}
async function removeTheme(id:string){const db=await openThemes();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('themes','readwrite');tx.objectStore('themes').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();}
type CanvaLibraryItem={id:string;title:string;thumbnail:string;editUrl:string};
const blobToData=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});

const DB='prescreator-designs-v1';
const store=async()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('designs',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function saveDesign(d:Design){const db=await store();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('designs','readwrite');tx.objectStore('designs').put(d);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
async function getDesigns():Promise<Design[]>{const db=await store();const result=await new Promise<Design[]>((resolve,reject)=>{const r=db.transaction('designs','readonly').objectStore('designs').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return result.sort((a,b)=>b.updated-a.updated)}
async function deleteDesign(id:string){const db=await store();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('designs','readwrite');tx.objectStore('designs').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
const dims=(d:Design):[number,number]=>d.orientation==='portrait'?[1080,1350]:d.orientation==='square'?[1080,1080]:[1920,1080];
function fitFont(base:number,d:Design){return d.orientation==='portrait'?Math.round(base*.85):base}
function SlideArtwork({design,mini=false}:{design:Design;mini?:boolean}){
 const t=design.theme;
 const bg=t.type==='image'&&t.background?`linear-gradient(0deg,rgba(0,0,0,.28),rgba(0,0,0,.28)),url("${t.background}")`:t.type==='solid'?t.colors[0]:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})`;
 const orient=design.orientation==='portrait'?'portrait':design.orientation==='square'?'square':'landscape';
 return <div className={'ds-art '+orient+' ds-'+t.layout+(mini?' ds-mini':'')} style={{background:bg,backgroundRepeat:'no-repeat',backgroundSize:'cover',backgroundPosition:'center',color:t.type==='image'?'white':t.foreground,fontFamily:t.font}}>
  <div className="ds-decoration" style={{borderColor:t.accent}}/>
  <div className="ds-inner">
    {design.output==='invite'&&<div className="ds-kicker" style={{color:t.accent}}>YOU ARE INVITED</div>}
    {design.output==='poster'&&<div className="ds-kicker" style={{color:t.accent}}>JOIN US</div>}
    {design.output==='announcement'&&<div className="ds-kicker" style={{color:t.accent}}>CHURCH UPDATES</div>}
    <div className="ds-title">{design.title||'Your title'}</div>
    {design.subtitle&&<div className="ds-subtitle">{design.subtitle}</div>}
    {design.body&&<div className="ds-body">{design.body}</div>}
    {(design.date||design.time||design.venue||design.address)&&<div className="ds-details">{[dateText(design.date),timeText(design.time),design.venue,design.address].filter(Boolean).map((x,i)=><div key={i}>{x}</div>)}</div>}
    {design.footer&&<div className="ds-footer">{design.footer}</div>}
  </div>
 </div>
}
function wrapText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){const lines:string[]=[];for(const para of text.split('\n')){let line='';for(const w of para.split(/\s+/)){const candidate=line?line+' '+w:w;if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=w}else line=candidate;}lines.push(line);}return lines}
async function renderPng(d:Design){const [w,h]=dims(d),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x)throw Error('Canvas not supported');const t=d.theme;
 if(t.type==='image'&&t.background){const img=new Image();img.src=t.background;await new Promise<void>((r,j)=>{img.onload=()=>r();img.onerror=()=>j(Error('Background image could not load'))});const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight);const iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;x.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,w,h)}else if(t.type==='solid'){x.fillStyle=t.colors[0];x.fillRect(0,0,w,h)}else{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,t.colors[0]);g.addColorStop(1,t.colors[1]);x.fillStyle=g;x.fillRect(0,0,w,h)}
 if(t.layout==='frame'){x.strokeStyle=t.accent;x.lineWidth=3;x.strokeRect(w*.055,h*.07,w*.89,h*.86)}
 const textColor=t.type==='image'?'#ffffff':t.foreground;x.fillStyle=textColor;x.textAlign=t.layout==='left'?'left':'center';x.textBaseline='middle';const cx=t.layout==='left'?w*.12:w/2,maxWidth=w*(t.layout==='left'?.76:.78);
 const parts:{text:string;size:number;color:string;weight:string;gap:number}[]=[];
 if(d.output==='invite'||d.output==='poster'||d.output==='announcement')parts.push({text:d.output==='invite'?'YOU ARE INVITED':d.output==='poster'?'JOIN US':'CHURCH UPDATES',size:fitFont(32,d),color:t.accent,weight:'bold',gap:34});
 parts.push({text:d.title||'Your title',size:fitFont(d.output==='title'||d.output==='section'?100:82,d),color:textColor,weight:'bold',gap:42});
 if(d.subtitle)parts.push({text:d.subtitle,size:fitFont(44,d),color:textColor,weight:'normal',gap:38});
 if(d.body)parts.push({text:d.body,size:fitFont(35,d),color:textColor,weight:'normal',gap:36});
 const details=[dateText(d.date),timeText(d.time),d.venue,d.address].filter(Boolean);if(details.length)parts.push({text:details.join('\n'),size:fitFont(34,d),color:textColor,weight:'normal',gap:36});
 if(d.footer)parts.push({text:d.footer,size:fitFont(26,d),color:t.accent,weight:'normal',gap:20});
 const fontName=t.font.split(',')[0].replace(/['"]/g,'');const prepared=parts.map(part=>{const font=`${part.weight} ${part.size}px "${fontName}"`;x.font=font;return {...part,font,lines:wrapText(x,part.text,maxWidth)}});
 const total=prepared.reduce((s,p)=>s+p.lines.length*p.size*1.3+p.gap,0);const scale=Math.min(1,h*.72/total);let y=(h-total*scale)/2;
 for(const part of prepared){x.fillStyle=part.color;x.font=`${part.weight} ${Math.round(part.size*scale)}px "${fontName}"`;const lineH=part.size*scale*1.3;for(const line of part.lines){x.fillText(line,cx,y+lineH/2,maxWidth);y+=lineH}y+=part.gap*scale}
 return await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG export failed')),'image/png'));
}
const saveBlob=(blob:Blob,name:string)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)};
const WORKER='https://prescreator-api.romz-marco15.workers.dev';
type CanvaVersion={id:string;preview:string;editUrl:string;title:string;created:number};
type CanvaProps={canvaSession:string|null;canvaAccount:'1'|'2';canvaNames:Record<string,string>;canvaSessions:Record<string,string>;onAccountChange:(id:'1'|'2')=>void;onConnect:(needsAssets?:boolean)=>void};
export default function DesignStudio({canvaSession,canvaAccount,canvaNames,canvaSessions,onAccountChange,onConnect}:CanvaProps){
 const [design,setDesign]=useState<Design>(()=>newDesign()),[tab,setTab]=useState<'themes'|Output>('themes'),[saved,setSaved]=useState<Design[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[ideas,setIdeas]=useState<Theme[]>(defaultThemes),[selected,setSelected]=useState('cream'),[themePrompt,setThemePrompt]=useState('');const fileRef=useRef<HTMLInputElement>(null);
 const [source,setSource]=useState<'native'|'ai'>('native');
 const [aiInstructions,setAiInstructions]=useState('Minimalist and professional church design. Strong typographic hierarchy.');
 const [aiVersions,setAiVersions]=useState<CanvaVersion[]>([]),[aiIndex,setAiIndex]=useState(0);
 const [savedCanvaUrl,setSavedCanvaUrl]=useState('');
 const [themes,setThemes]=useState<Theme[]>([]);
 const [themeSource,setThemeSource]=useState<'local'|'canva'>('local');
 const [canvaLibrary,setCanvaLibrary]=useState<CanvaLibraryItem[]>([]);
 const [canvaContinuation,setCanvaContinuation]=useState<string|null>(null);
 const [canvaFilter,setCanvaFilter]=useState('');
 const [loadingLibrary,setLoadingLibrary]=useState(false);
 const [themeName,setThemeName]=useState('');

 const currentAI=aiVersions[aiIndex];
 const canvaApi=async(path:string,method='GET',payload?:unknown)=>{
  if(!canvaSession)throw Error('Connect a Canva account first');
  const resp=await fetch(WORKER+'/app/'+path,{method,headers:{Authorization:'Bearer '+canvaSession,...(method==='POST'?{'Content-Type':'application/json'}:{})},body:method==='POST'?JSON.stringify(payload??{}):undefined});
  const result=await resp.json().catch(()=>({error:'Unexpected response from Canva'}));
  if(!resp.ok)throw Error(result.error||('Canva API HTTP '+resp.status));return result;
 };
 const poll=async(path:string,limit=85)=>{for(let attempt=0;attempt<limit;attempt++){const result=await canvaApi(path);if(result.status==='success')return result;if(result.status==='failed'||result.status==='unknown')throw Error(result.error||'Canva job failed');await new Promise(r=>setTimeout(r,2500));}throw Error('Canva is still processing. Check your Canva Projects before retrying.');};
 const refreshThemeList=async()=>{setThemes(await savedThemes());};
 const saveCurrentTheme=async()=>{try{const t={...design.theme,id:crypto.randomUUID(),name:themeName.trim()||design.theme.name+' (saved)'};await putTheme(t);await refreshThemeList();setSelected(t.id);setDesign(d=>({...d,theme:t}));setMessage('Theme saved locally. It can now be used for posters, invites, announcements and slides.');}catch(e){setMessage('Theme could not be saved: '+String(e))}};
 const fetchCanvaLibrary=async(next=false)=>{if(!canvaSession){onConnect();setMessage('Connect the selected Canva account first.');return;}setLoadingLibrary(true);try{const q=next&&canvaContinuation?'?continuation='+encodeURIComponent(canvaContinuation):'';const data=await canvaApi('theme-designs'+q);setCanvaLibrary(old=>next?[...old,...(data.items||[])]:data.items||[]);setCanvaContinuation(data.continuation||null);setMessage('Canva designs loaded. Select one to save its preview as a local reusable theme.');}catch(e){setMessage('Unable to list Canva designs: '+String(e))}finally{setLoadingLibrary(false)}};
 const importCanvaTheme=async(item:CanvaLibraryItem)=>{if(!canvaSession){onConnect();return;}setBusy(true);try{
   const response=await fetch(WORKER+'/app/theme-image?designId='+encodeURIComponent(item.id),{headers:{Authorization:'Bearer '+canvaSession}});
   if(!response.ok){const info=await response.json().catch(()=>({}));throw Error(info.error||('Image HTTP '+response.status));}
   const blob=await response.blob();if(!blob.type.startsWith('image/'))throw Error('Canva did not provide an image.');if(blob.size>5*1024*1024)throw Error('Image is too large to save locally.');
   const background=await blobToData(blob);
   const t:Theme={id:crypto.randomUUID(),name:item.title||'Canva theme',type:'image',colors:['#1d2538','#394767'],accent:'#e6d3ad',foreground:'#ffffff',font:'Arial, sans-serif',layout:'center',background,source:'canva',canvaDesignId:item.id,styleNotes:`Visual inspiration: ${item.title||'Canva design'}. Preserve a consistent look, elegant hierarchy and legible text.`};
   await putTheme(t);await refreshThemeList();choose(t);setThemeSource('local');setSource('native');setMessage('Canva design preview imported as a local background. PresCreator text remains editable; the original Canva elements are not.');
  }catch(e){setMessage('Could not import Canva theme: '+String(e))}finally{setBusy(false)}};
 const saveAITheme=async()=>{if(!currentAI){setMessage('Generate an AI concept first.');return;}await importCanvaTheme({id:currentAI.id,title:currentAI.title+' · AI theme',thumbnail:currentAI.preview,editUrl:currentAI.editUrl});};
 const generateCanva=async()=>{
  if(!canvaSession){onConnect();setMessage('Connect Canva, then generate your design.');return;}
  setBusy(true);setMessage('Creating a Canva AI 16:9 presentation design...');
  try{
   const baseStyle=`${themePrompt}. Selected theme: ${design.theme.name}. Style notes: ${design.theme.styleNotes||'none'}. Theme source: ${design.theme.source||'native'}. Colors: ${design.theme.colors.join(', ')}. Typeface mood: ${design.theme.font}. Layout: ${design.theme.layout}. ${design.theme.canvaDesignId?'A Canva design inspired the theme. Treat this as text-only styling guidance; no exact design clone is supplied.':''}`;
   const started=await canvaApi('design-generate','POST',{kind:tab==='themes'?'visual theme concept':tab,title:design.title||themePrompt||'Church worship design',subtitle:design.subtitle,body:design.body,date:dateText(design.date),time:timeText(design.time),venue:design.venue,address:design.address,footer:design.footer,style:baseStyle,instructions:aiInstructions});
   setMessage('Canva is generating the concept. This may take a minute...');
   const done=await poll('generation-status?job='+encodeURIComponent(started.jobId),140);
   if(!done.designId)throw Error('Design completed without a design ID. Check Canva Projects.');
   const version:CanvaVersion={id:done.designId,preview:'',editUrl:done.editUrl||'https://www.canva.com/projects',title:design.title||'Untitled',created:Date.now()};
   setAiVersions(v=>[version,...v].slice(0,12));setAiIndex(0);
   setMessage('Generated in Canva. Loading slide image...');
   try{
    const ex=await canvaApi('export','POST',{designId:done.designId});
    const exported=await poll('export-status?job='+encodeURIComponent(ex.jobId),90);
    const image=Array.isArray(exported.urls)?exported.urls[0]:null;
    if(image){setAiVersions(v=>v.map(x=>x.id===done.designId?{...x,preview:image}:x));setMessage('Canva concept ready. You can regenerate more versions.');}
    else setMessage('Canva generated the design but did not return a PNG preview. Open it in Canva.');
   }catch(e){setMessage('Canva design saved, but preview unavailable: '+String(e));}
  }catch(e){setMessage('Canva AI generation failed: '+String(e));}finally{setBusy(false)}
 };
 const saveToCanva=async()=>{
  if(!canvaSession){onConnect(true);setMessage('Connect Canva with image upload permissions first, then save.');return;}
  setBusy(true);setMessage('Uploading the rendered native design to Canva...');
  try{
   const png=await renderPng(design);
   const upload=await fetch(WORKER+'/app/design-upload',{method:'POST',headers:{Authorization:'Bearer '+canvaSession,'Content-Type':'image/png','X-Design-Name':encodeURIComponent(design.title.slice(0,45)||'PresCreator design')},body:png});
   const start=await upload.json().catch(()=>({error:'Upload request failed'}));
   if(!upload.ok)throw Error(start.error||('Canva upload HTTP '+upload.status));
   const finished=await poll('design-upload-status?job='+encodeURIComponent(start.jobId),90);
   if(!finished.assetId)throw Error('Canva did not return the uploaded asset ID');
   const [width,height]=dims(design);
   const result=await canvaApi('design-create','POST',{assetId:finished.assetId,width,height,title:design.title});
   setSavedCanvaUrl(result.editUrl||'https://www.canva.com/projects');
   setMessage('Saved as a custom-size Canva design. The artwork is a single image layer; edit the original text in PresCreator.');
  }catch(e){setMessage('Save to Canva failed: '+String(e)+'. Requires asset:write, asset:read, and design:content:write in the Canva integration.');}finally{setBusy(false)}
 };

 useEffect(()=>{getDesigns().then(setSaved).catch(()=>setMessage('Local design storage unavailable.'));refreshThemeList().catch(()=>setMessage('Local theme storage unavailable.'))},[]);
 useEffect(()=>{setCanvaLibrary([]);setCanvaContinuation(null);},[canvaAccount,canvaSession]);
 const patch=(p:Partial<Design>)=>setDesign(d=>({...d,...p,updated:Date.now()}));
 const patchTheme=(p:Partial<Theme>)=>setDesign(d=>({...d,theme:{...d.theme,...p},updated:Date.now()}));
 const choose=(theme:Theme)=>{setSelected(theme.id);patch({theme:{...theme}});setMessage('Theme selected. You can now create any item with this style.');};
 const selectTab=(out:Output|'themes')=>{setTab(out);if(out!=='themes')patch({output:out,orientation:out==='poster'||out==='invite'?'portrait':'landscape'});};
 const createOptions=()=>{const q=themePrompt.toLowerCase();const base=q.match(/flower|floral|rose|pink/)?defaultThemes[4]:q.match(/green|nature|forest|earth/)?defaultThemes[2]:q.match(/youth|neon|bold/)?defaultThemes[5]:q.match(/warm|beige|cream|minimal/)?defaultThemes[0]:q.match(/purple|modern|worship/)?defaultThemes[3]:defaultThemes[1];const rotation=defaultThemes.map((t,i)=>({...t,id:'variant-'+Date.now()+'-'+i,colors:i===0?base.colors:i%2===0?[t.colors[1],t.colors[0]] as [string,string]:t.colors,layout:(['center','left','frame'] as const)[i%3],name:i===0?base.name+' · from prompt':t.name}));setIdeas(rotation);setMessage('Six native design variations generated from your theme direction. Select one to reuse.');};
 const upload=async(file?:File)=>{if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setMessage('Use a PNG, JPEG, or WebP image smaller than 2 MB.');return;}const reader=new FileReader();reader.onload=()=>patchTheme({type:'image',background:String(reader.result)});reader.readAsDataURL(file)};
 const doSave=async()=>{setBusy(true);try{await saveDesign(design);setSaved(await getDesigns());setMessage('Design saved locally on this device.')}catch(e){setMessage('Save failed: '+String(e))}finally{setBusy(false)}};
 const exportImage=async()=>{setBusy(true);try{const image=await renderPng(design);saveBlob(image,(design.title||'prescreator-design').replace(/[^\w-]+/g,'-')+'.png');setMessage('PNG downloaded.')}catch(e){setMessage(String(e))}finally{setBusy(false)}};
 const useSaved=(d:Design)=>{setDesign(structuredClone(d));setTab(d.output);setSelected(d.theme.id);setMessage('Saved design loaded.');};
 const copyDesign=()=>{setDesign(d=>({...structuredClone(d),id:crypto.randomUUID(),name:d.name+' (copy)',updated:Date.now()}));setMessage('New copy created.');};
 const label=(type:Output)=>({title:'Title Slide',section:'Section Divider',announcement:'Announcement',poster:'Poster',invite:'E-Invite'}[type]);
 return <div className="ds-workspace">
  <div className="ds-tabs"><button className={tab==='themes'?'active':''} onClick={()=>setTab('themes')}>Theme Picker</button>{(['title','section','announcement','poster','invite'] as Output[]).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>selectTab(t)}>{label(t)}</button>)}</div>
  {message&&<div className="ds-notice" role="status"><Info size={15}/>{message}<button onClick={()=>setMessage('')}>×</button></div>}
  <div className="ds-mode"><div className="ds-modeswitch"><button className={source==='native'?'selected':''} onClick={()=>setSource('native')}>Native editor</button><button className={source==='ai'?'selected':''} onClick={()=>setSource('ai')}>Canva AI concepts</button></div><span>Use the same theme and details in Native, then switch to Canva AI to request a redesign. Original Native design is preserved.</span></div><div className="ds-layout"><section className="ds-panel">
   {tab==='themes'?<><h2>Choose a visual identity</h2><p>Pick a style once, then reuse it across posters, invites, and presentation slides.</p><label>Design direction</label><input aria-label="Design direction" value={themePrompt} placeholder="e.g. warm floral worship" onChange={e=>setThemePrompt(e.target.value)}/><small className="ds-help">Native concept variations use color and style keywords from your prompt. For AI concepts, switch to Canva AI above. Canva generates one 16:9 presentation design per request.</small><button className="ds-btn secondary" onClick={createOptions}><RefreshCw size={15}/> Refresh native concepts</button><div className="ds-themegrid">{ideas.map(t=><button key={t.id} className={'ds-theme '+(selected===t.id?'selected':'')} onClick={()=>choose(t)}><span style={{background:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})`,color:t.foreground,fontFamily:t.font}}>{t.name}</span><b>{t.name}</b></button>)}</div>
   <h3>Theme Library</h3><div className="ds-mode ds-smalltabs"><div className="ds-modeswitch"><button className={themeSource==='local'?'selected':''} onClick={()=>setThemeSource('local')}>Local Themes</button><button className={themeSource==='canva'?'selected':''} onClick={()=>setThemeSource('canva')}>My Canva Designs</button></div></div>
   {themeSource==='local'?<><div className="ds-fieldgrid"><div><label>Theme name</label><input value={themeName} onChange={e=>setThemeName(e.target.value)} placeholder="e.g. Sunday Beige"/></div><button className="ds-btn secondary ds-save-theme" onClick={saveCurrentTheme}><Save size={14}/> Save current theme</button></div><div className="ds-themegrid">{themes.map(t=><div key={t.id} className="ds-theme-entry"><button className={'ds-theme '+(selected===t.id?'selected':'')} onClick={()=>choose(t)}><span style={{background:t.type==='image'&&t.background?`url(${t.background}) center / cover no-repeat`:t.type==='solid'?t.colors[0]:`linear-gradient(135deg,${t.colors.join(',')})`,color:t.foreground}}>{t.type==='image'?'':'Aa'}</span><b>{t.name}</b></button><button className="ds-theme-delete" title="Delete local theme" onClick={async()=>{await removeTheme(t.id);await refreshThemeList();}}><Trash2 size={13}/></button></div>)}</div>{!themes.length&&<small>No saved themes yet. Save your current theme or import one from Canva.</small>}</>:
   <><div className="ds-actions"><button className="ds-btn secondary" disabled={loadingLibrary} onClick={()=>fetchCanvaLibrary(false)}><RefreshCw size={14}/>{loadingLibrary?'Loading...':'Load Canva designs'}</button></div><label>Search loaded designs</label><input value={canvaFilter} onChange={e=>setCanvaFilter(e.target.value)} placeholder="Search by design title"/><div className="ds-themegrid">{canvaLibrary.filter(item=>item.title.toLowerCase().includes(canvaFilter.toLowerCase())).map(item=><div className="ds-canva-theme" key={item.id}>{item.thumbnail?<img src={item.thumbnail} alt="Canva design preview" loading="lazy"/>:<div className="ds-no-thumb">No thumbnail</div>}<strong>{item.title}</strong><div className="ds-actions"><button className="ds-btn secondary" disabled={busy} onClick={()=>importCanvaTheme(item)}>Use as theme</button>{item.editUrl&&<a className="ds-btn secondary" href={item.editUrl} target="_blank" rel="noreferrer">Open</a>}</div></div>)}</div>{canvaContinuation&&<button className="ds-btn secondary" disabled={loadingLibrary} onClick={()=>fetchCanvaLibrary(true)}>Load more</button>}<small className="ds-help">A Canva design is imported as background artwork. Native text and layout are editable, but the Canva design's original objects are not.</small></>}
   <div className="ds-actions">{(['title','section','announcement','poster','invite'] as Output[]).map(t=><button className="ds-btn secondary" key={t} onClick={()=>selectTab(t)}><Plus size={14}/> {label(t)}</button>)}</div></>:
   <><h2>{label(tab)}</h2><p>{tab==='title'?'One title slide before a sermon or worship song.':tab==='section'?'A simple divider for Praise & Worship, Announcements, or Prayer.':tab==='announcement'?'A clear slide for important church notices.':tab==='poster'?'An editable portrait, square, or landscape event poster.':'An invitation with event date, time, and location.'}</p>
    <label>Design name</label><input value={design.name} onChange={e=>patch({name:e.target.value})}/>
    <label>Main title</label><input value={design.title} onChange={e=>patch({title:e.target.value})}/>
    <div className="ds-quick">{tab==='section'?['Praise and Worship','Teaching','Announcements','Prayer','Welcome','Offering'].map(s=><button key={s} onClick={()=>patch({title:s})}>{s}</button>):tab==='announcement'?['Announcements','Life Groups','Sunday Service','Upcoming Events'].map(s=><button key={s} onClick={()=>patch({title:s})}>{s}</button>):null}</div>
    <label>Subtitle (optional)</label><input value={design.subtitle} onChange={e=>patch({subtitle:e.target.value})}/>
    {(tab==='poster'||tab==='invite'||tab==='announcement')&&<><label>Description / announcement details</label><textarea rows={3} value={design.body} onChange={e=>patch({body:e.target.value})}/><div className="ds-fieldgrid"><div><label>Date</label><input type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(design.date)?design.date:""} onChange={e=>patch({date:e.target.value})}/>{design.date&&!/^\d{4}-\d{2}-\d{2}$/.test(design.date)&&<small className="ds-help">Previous custom date: {design.date}. Pick a date to replace it.</small>}</div><div><label>Time</label><input type="time" value={/^([01]\d|2[0-3]):[0-5]\d$/.test(design.time)?design.time:""} onChange={e=>patch({time:e.target.value})}/>{design.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(design.time)&&<small className="ds-help">Previous custom time: {design.time}. Pick a time to replace it.</small>}</div></div><label>Venue</label><input value={design.venue} onChange={e=>patch({venue:e.target.value})}/><label>Address</label><input value={design.address} onChange={e=>patch({address:e.target.value})}/></>}
    <label>Footer (optional)</label><input value={design.footer} onChange={e=>patch({footer:e.target.value})}/>
    <label>Format</label><select value={design.orientation} onChange={e=>patch({orientation:e.target.value as Orientation})}><option value="landscape">16:9 Landscape</option><option value="portrait">Portrait</option><option value="square">Square</option></select>
    <label>Theme</label><select value={design.theme.id} onChange={e=>{const th=[...ideas,...themes].find(x=>x.id===e.target.value);if(th)choose(th)}}>{![...ideas,...themes].some(t=>t.id===design.theme.id)&&<option value={design.theme.id}>{design.theme.name}</option>}{[...ideas,...themes].map(th=><option key={th.id} value={th.id}>{th.name}{th.source==='canva'?' · Canva':''}</option>)}</select><button className="ds-btn secondary" onClick={()=>setTab('themes')}><FolderOpen size={14}/> Browse Theme Library</button>
    <label>Background mode</label><select value={design.theme.type} onChange={e=>patchTheme({type:e.target.value as Theme['type']})}><option value="gradient">Gradient</option><option value="solid">Solid color</option><option value="image">Uploaded image</option></select>
    {design.theme.type!=='image'?<div className="ds-fieldgrid"><div><label>Color 1</label><input type="color" value={design.theme.colors[0]} onChange={e=>patchTheme({colors:[e.target.value,design.theme.colors[1]]})}/></div>{design.theme.type==='gradient'&&<div><label>Color 2</label><input type="color" value={design.theme.colors[1]} onChange={e=>patchTheme({colors:[design.theme.colors[0],e.target.value]})}/></div>}</div>:<><input ref={fileRef} style={{display:'none'}} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])}/><button className="ds-btn secondary" onClick={()=>fileRef.current?.click()}><ImagePlus size={14}/> Upload background</button></>}
    <div className="ds-fieldgrid"><div><label>Text color</label><input type="color" value={design.theme.foreground} onChange={e=>patchTheme({foreground:e.target.value})}/></div><div><label>Accent color</label><input type="color" value={design.theme.accent} onChange={e=>patchTheme({accent:e.target.value})}/></div></div>
    <label>Font</label><select value={design.theme.font} onChange={e=>patchTheme({font:e.target.value})}>{['Arial, sans-serif','Arial Black, sans-serif','Georgia, serif','Times New Roman, serif','Verdana, sans-serif','Trebuchet MS, sans-serif','Impact, sans-serif'].map(font=><option key={font} value={font}>{font.split(',')[0]}</option>)}</select>
    <label>Layout</label><select value={design.theme.layout} onChange={e=>patchTheme({layout:e.target.value as Theme['layout']})}><option value="center">Centered</option><option value="left">Left aligned</option><option value="frame">Elegant frame</option></select>
    <div className="ds-actions"><button className="ds-btn secondary" onClick={saveCurrentTheme}><Save size={14}/> Save theme</button><button className="ds-btn primary" onClick={doSave} disabled={busy}><Save size={15}/> Save locally</button><button className="ds-btn secondary" onClick={exportImage} disabled={busy}><Download size={15}/> Download PNG</button><button className="ds-btn secondary" onClick={copyDesign}><Copy size={15}/> Duplicate</button></div>
   </>}
   <div className="ds-canva-panel"><h3><Cloud size={17}/> Canva connection</h3><select value={canvaAccount} onChange={e=>onAccountChange(e.target.value as '1'|'2')}>{(['1','2'] as const).map(id=><option key={id} value={id}>{canvaNames[id]||'Canva account '+id}{canvaSessions[id]?' (connected)':''}</option>)}</select>
   {!canvaSession&&<button className="ds-btn secondary" onClick={()=>onConnect()}>Connect Canva</button>}
   {source==='ai'?<><label>Additional AI instructions</label><textarea rows={3} value={aiInstructions} onChange={e=>setAiInstructions(e.target.value)} placeholder="Minimalist floral worship, elegant font pairing, soft shadows..."/><small className="ds-help">Canva AI supports 16:9 presentation concepts here. Portrait and square outputs are generated exactly in Native mode, not via this AI endpoint. Each regeneration may use AI credits.</small><button className="ds-btn primary" disabled={busy} onClick={generateCanva}><Sparkles size={15}/>{busy?'Working...':aiVersions.length?'Generate another Canva variation':'Generate with Canva AI'}</button></>:
   <div className="ds-actions"><button className="ds-btn primary" onClick={()=>setSource('ai')}><Sparkles size={14}/> Redesign with Canva AI</button><button className="ds-btn secondary" onClick={()=>onConnect(true)} disabled={busy}>Authorize image upload</button><button className="ds-btn secondary" disabled={busy} onClick={saveToCanva}><Cloud size={15}/> Save Native design to Canva</button>{savedCanvaUrl&&<a className="ds-btn secondary" href={savedCanvaUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open in Canva</a>}</div>}
   </div>
  </section><section className="ds-preview"><div className="ds-previewhead"><div><h2>{source==='ai'?'Canva AI design preview':'Live design preview'}</h2><small>{source==='ai'?'Canva versions appear here after generation':'Edits update without regenerating'}</small></div>{source==='native'&&<button className="ds-btn primary" disabled={busy} onClick={exportImage}><Download size={15}/> Export PNG</button>}</div><div className="ds-stage">{source==='native'?<SlideArtwork design={design}/>:currentAI?.preview?<img className="ds-ai-preview" src={currentAI.preview} alt="Canva AI-generated concept"/>:currentAI?<div className="ds-ai-empty">Canva created the design, but no image preview was returned.<a href={currentAI.editUrl} target="_blank" rel="noreferrer">Open in Canva</a></div>:<div className="ds-ai-empty"><Sparkles size={30}/>Generate a Canva AI concept to preview it here.</div>}</div>
   {source==='ai'&&<div className="ds-ai-history"><h3>AI design versions ({aiVersions.length})</h3><div className="ds-ai-cards">{aiVersions.map((v,i)=><button key={v.id} className={aiIndex===i?'selected':''} onClick={()=>setAiIndex(i)}>{v.preview?<img src={v.preview} alt="AI variation thumbnail"/>:<span>Design {i+1}</span>}<small>{new Date(v.created).toLocaleTimeString()}</small></button>)}</div>{currentAI&&<button className="ds-btn secondary" disabled={busy} onClick={saveAITheme}><Save size={14}/> Save AI design as local theme</button>}{currentAI&&<a className="ds-btn primary" href={currentAI.editUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Edit AI design in Canva</a>}</div>}<p className="ds-muted">{source==='native'?'Native preview uses the selected format. Landscape 1920×1080, portrait 1080×1350, square 1080×1080. Canva Save uploads a flattened artwork layer.':'Canva AI returns an editable Canva presentation (16:9); actual page count, wording and style may vary. Open in Canva to edit it.'}</p><h3>Saved designs</h3>{saved.length?<div className="ds-saved">{saved.map(d=><div key={d.id} className="ds-saveditem"><button onClick={()=>useSaved(d)}><SlideArtwork mini design={d}/><span>{d.name}<small>{d.output} · {new Date(d.updated).toLocaleDateString()}</small></span></button><button aria-label="Delete saved design" title="Delete" onClick={async()=>{await deleteDesign(d.id);setSaved(await getDesigns())}}><Trash2 size={16}/></button></div>)}</div>:<p className="ds-muted">No saved designs yet. Use Save locally to keep a theme and slide on this device.</p>}
   <div className="ds-footerinfo"><Check size={14}/> No Canva account or Cloudflare storage is needed for native designs.</div>
  </section></div>
 </div>
}
