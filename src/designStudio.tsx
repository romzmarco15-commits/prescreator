import {useEffect,useRef,useState} from 'react';
import {Download,Save,Plus,ImagePlus,Trash2,RefreshCw,Copy,Check,Info,Sparkles,ExternalLink,Cloud,FolderOpen} from 'lucide-react';
import './designStudio.css';

type Output='title'|'section'|'announcement'|'poster'|'invite';
type Orientation='landscape'|'portrait'|'square';
type LayoutName='title'|'section'|'invite'|'announcement'|'blank';
type LayoutConfig={alignment:'center'|'left'|'frame';titleScale:number;accentStyle:'line'|'frame'|'none'};
type Theme={id:string;name:string;type:'gradient'|'solid'|'image';colors:[string,string];accent:string;foreground:string;font:string;layout:'center'|'left'|'frame';background?:string;source?:'native'|'canva'|'ai';canvaDesignId?:string;styleNotes?:string;referenceImage?:string;layouts?:Partial<Record<LayoutName,LayoutConfig>>};
const layoutDefaults:Record<LayoutName,LayoutConfig>={title:{alignment:'center',titleScale:1,accentStyle:'line'},section:{alignment:'center',titleScale:.86,accentStyle:'line'},invite:{alignment:'center',titleScale:.8,accentStyle:'frame'},announcement:{alignment:'left',titleScale:.85,accentStyle:'line'},blank:{alignment:'center',titleScale:1,accentStyle:'none'}};
const isAITheme=(t:Theme)=>t.source==='ai'||t.source==='canva';
const themeLayout=(t:Theme,key:LayoutName):LayoutConfig=>t.layouts?.[key]||layoutDefaults[key];
// Legacy Canva themes stored a completed slide as the background, baking old text into new designs.
// Treat those saved images as references only and always compose new editable text over fresh artwork.
const normalizeTheme=(t:Theme):Theme=>t.source==='canva'||t.source==='ai'?{...t,type:t.type==='image'?'gradient':t.type,referenceImage:t.referenceImage||t.background,background:undefined,layouts:t.layouts||layoutDefaults}:({...t,layouts:t.layouts||layoutDefaults});
type Design={id:string;name:string;output:Output;orientation:Orientation;theme:Theme;title:string;subtitle:string;body:string;date:string;time:string;venue:string;address:string;footer:string;blank?:boolean;updated:number};
const defaultThemes:Theme[]=[
 {id:'cream',name:'Warm Minimalist',type:'gradient',colors:['#f9f4e9','#e3cfb3'],accent:'#876448',foreground:'#342d29',font:'Georgia, serif',layout:'center'},
 {id:'navy',name:'Elegant Navy',type:'gradient',colors:['#101b34','#34466d'],accent:'#d7bb84',foreground:'#ffffff',font:'Georgia, serif',layout:'center'},
 {id:'forest',name:'Forest Reflection',type:'gradient',colors:['#152e2a','#537668'],accent:'#dfd5b3',foreground:'#ffffff',font:'Georgia, serif',layout:'left'},
 {id:'violet',name:'Modern Worship',type:'gradient',colors:['#241a4e','#8451ac'],accent:'#e9bbff',foreground:'#ffffff',font:'Arial, sans-serif',layout:'center'},
 {id:'rose',name:'Soft Floral',type:'gradient',colors:['#f8e9e3','#ddb2b0'],accent:'#995962',foreground:'#3b2731',font:'Georgia, serif',layout:'frame'},
 {id:'youth',name:'Youth Energy',type:'gradient',colors:['#161335','#7541d8'],accent:'#adffbd',foreground:'#ffffff',font:'Arial Black, sans-serif',layout:'left'}
];
const newDesign=(theme=defaultThemes[0],output:Output='title'):Design=>({id:crypto.randomUUID(),name:'New design',output,orientation:output==='poster'||output==='invite'?'portrait':'landscape',theme:{...theme},title:output==='section'?'Praise and Worship':output==='announcement'?'Announcements':output==='poster'?'Sunday Service':output==='invite'?'You Are Invited':'Sunday Worship',subtitle:output==='title'?'Hope Filipino Axis':'',body:'',date:'',time:'',venue:'',address:'',footer:'',blank:false,updated:Date.now()});
const dateText=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}):s;
const timeText=(s:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s)?new Date('2000-01-01T'+s+':00').toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}):s;
const THEME_DB='prescreator-themes-v1';
const openThemes=()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(THEME_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('themes'))r.result.createObjectStore('themes',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function savedThemes():Promise<Theme[]>{const db=await openThemes();const rows=await new Promise<Theme[]>((resolve,reject)=>{const r=db.transaction('themes','readonly').objectStore('themes').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return rows;}
async function putTheme(t:Theme){const db=await openThemes();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('themes','readwrite');tx.objectStore('themes').put(t);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();}
async function removeTheme(id:string){const db=await openThemes();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('themes','readwrite');tx.objectStore('themes').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close();}
type CanvaLibraryItem={id:string;title:string;thumbnail:string;editUrl:string};

const DB='prescreator-designs-v1';
const store=async()=>new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('designs',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function saveDesign(d:Design){const db=await store();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('designs','readwrite');tx.objectStore('designs').put(d);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
async function getDesigns():Promise<Design[]>{const db=await store();const result=await new Promise<Design[]>((resolve,reject)=>{const r=db.transaction('designs','readonly').objectStore('designs').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return result.sort((a,b)=>b.updated-a.updated)}
async function deleteDesign(id:string){const db=await store();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('designs','readwrite');tx.objectStore('designs').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
const dims=(d:Design):[number,number]=>d.orientation==='portrait'?[1080,1350]:d.orientation==='square'?[1080,1080]:[1920,1080];
function fitFont(base:number,d:Design){return d.orientation==='portrait'?Math.round(base*.85):base}
function SlideArtwork({design,mini=false}:{design:Design;mini?:boolean}){
 const t=normalizeTheme(design.theme);
 const layout=themeLayout(t,design.blank?'blank':design.output==='poster'?'invite':design.output);
 const bg=t.type==='image'&&t.background?`linear-gradient(0deg,rgba(0,0,0,.28),rgba(0,0,0,.28)),url("${t.background}")`:t.type==='solid'?t.colors[0]:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})`;
 const orient=design.orientation==='portrait'?'portrait':design.orientation==='square'?'square':'landscape';
 return <div className={'ds-art '+orient+' ds-'+layout.alignment+(mini?' ds-mini':'')} style={{background:bg,backgroundRepeat:'no-repeat',backgroundSize:'cover',backgroundPosition:'center',color:t.type==='image'?'white':t.foreground,fontFamily:t.font}}>
  <div className="ds-decoration" style={{borderColor:t.accent,display:layout.accentStyle==='frame'?undefined:'none'}}/>
  <div className="ds-inner">
    {!design.blank&&design.output==='invite'&&<div className="ds-kicker" style={{color:t.accent}}>YOU ARE INVITED</div>}
    {!design.blank&&design.output==='poster'&&<div className="ds-kicker" style={{color:t.accent}}>JOIN US</div>}
    {!design.blank&&design.output==='announcement'&&<div className="ds-kicker" style={{color:t.accent}}>CHURCH UPDATES</div>}
    {!design.blank&&<div className="ds-title" style={{fontSize:`${layout.titleScale*100}%`}}>{design.title||'Your title'}</div>}
    {!design.blank&&design.subtitle&&<div className="ds-subtitle">{design.subtitle}</div>}
    {!design.blank&&design.body&&<div className="ds-body">{design.body}</div>}
    {!design.blank&&(design.date||design.time||design.venue||design.address)&&<div className="ds-details">{[dateText(design.date),timeText(design.time),design.venue,design.address].filter(Boolean).map((x,i)=><div key={i}>{x}</div>)}</div>}
    {!design.blank&&design.footer&&<div className="ds-footer">{design.footer}</div>}
  </div>
 </div>
}
function wrapText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){const lines:string[]=[];for(const para of text.split('\n')){let line='';for(const w of para.split(/\s+/)){const candidate=line?line+' '+w:w;if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=w}else line=candidate;}lines.push(line);}return lines}
async function renderPng(d:Design){const [w,h]=dims(d),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x)throw Error('Canvas not supported');const t=normalizeTheme(d.theme);const layout=themeLayout(t,d.blank?'blank':d.output==='poster'?'invite':d.output);
 if(t.type==='image'&&t.background){const img=new Image();img.src=t.background;await new Promise<void>((r,j)=>{img.onload=()=>r();img.onerror=()=>j(Error('Background image could not load'))});const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight);const iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;x.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,w,h)}else if(t.type==='solid'){x.fillStyle=t.colors[0];x.fillRect(0,0,w,h)}else{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,t.colors[0]);g.addColorStop(1,t.colors[1]);x.fillStyle=g;x.fillRect(0,0,w,h)}
 if(layout.accentStyle==='frame'){x.strokeStyle=t.accent;x.lineWidth=3;x.strokeRect(w*.055,h*.07,w*.89,h*.86)}
 if(d.blank)return await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG export failed')),'image/png'));
 const textColor=t.type==='image'?'#ffffff':t.foreground;x.fillStyle=textColor;x.textAlign=layout.alignment==='left'?'left':'center';x.textBaseline='middle';const cx=layout.alignment==='left'?w*.12:w/2,maxWidth=w*(layout.alignment==='left'?.76:.78);
 const parts:{text:string;size:number;color:string;weight:string;gap:number}[]=[];
 if(d.output==='invite'||d.output==='poster'||d.output==='announcement')parts.push({text:d.output==='invite'?'YOU ARE INVITED':d.output==='poster'?'JOIN US':'CHURCH UPDATES',size:fitFont(32,d),color:t.accent,weight:'bold',gap:34});
 parts.push({text:d.title||'Your title',size:fitFont((d.output==='title'||d.output==='section'?100:82)*layout.titleScale,d),color:textColor,weight:'bold',gap:42});
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
type NativeVersion={id:string;design:Design;created:number};
type CanvaProps={canvaSession:string|null;canvaAccount:'1'|'2';canvaNames:Record<string,string>;canvaSessions:Record<string,string>;onAccountChange:(id:'1'|'2')=>void;onConnect:(needsAssets?:boolean)=>void};
export default function DesignStudio({canvaSession,canvaAccount,canvaNames,canvaSessions,onAccountChange,onConnect}:CanvaProps){
 const [design,setDesign]=useState<Design>(()=>newDesign()),[tab,setTab]=useState<'themes'|Output>('themes'),[saved,setSaved]=useState<Design[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[ideas,setIdeas]=useState<Theme[]>(defaultThemes),[selected,setSelected]=useState('cream'),[themePrompt,setThemePrompt]=useState('');const fileRef=useRef<HTMLInputElement>(null);
 const [source,setSource]=useState<'native'|'ai'>('native'); // Theme Studio only
 const [showPresetOptions,setShowPresetOptions]=useState(false);
 const [nativeVersions,setNativeVersions]=useState<NativeVersion[]>([]);
 const [previewKey,setPreviewKey]=useState('live');
 const [aiDetailsOpen,setAiDetailsOpen]=useState(false);
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
 const selectedAI=previewKey.startsWith('ai:')?aiVersions.find(v=>v.id===previewKey.slice(3)):null;
 const selectedNative=previewKey.startsWith('native:')?nativeVersions.find(v=>v.id===previewKey.slice(7)):null;
 const previewDesign=selectedNative?.design||design;
 const showAiPreview=!!selectedAI;
 const isThemeStudio=tab==='themes';
 const aiThemeSelected=isAITheme(design.theme);
 const canvaApi=async(path:string,method='GET',payload?:unknown)=>{
  if(!canvaSession)throw Error('Connect a Canva account first');
  const resp=await fetch(WORKER+'/app/'+path,{method,headers:{Authorization:'Bearer '+canvaSession,...(method==='POST'?{'Content-Type':'application/json'}:{})},body:method==='POST'?JSON.stringify(payload??{}):undefined});
  const result=await resp.json().catch(()=>({error:'Unexpected response from Canva'}));
  if(!resp.ok)throw Error(result.error||('Canva API HTTP '+resp.status));return result;
 };
 const poll=async(path:string,limit=85)=>{for(let attempt=0;attempt<limit;attempt++){const result=await canvaApi(path);if(result.status==='success')return result;if(result.status==='failed'||result.status==='unknown')throw Error(result.error||'Canva job failed');await new Promise(r=>setTimeout(r,2500));}throw Error('Canva is still processing. Check your Canva Projects before retrying.');};
 const refreshThemeList=async()=>{setThemes(await savedThemes());};
 const saveCurrentTheme=async()=>{try{const t={...normalizeTheme(design.theme),source:'native' as const,id:crypto.randomUUID(),name:themeName.trim()||design.theme.name+' (saved)'};await putTheme(t);await refreshThemeList();setSelected(t.id);setDesign(d=>({...d,theme:t}));setMessage(isAITheme(t)?'AI reference theme saved. It can guide Canva AI in any creator, but cannot be used to generate Native slides.':'Native theme saved with editable colors, fonts and layouts. You can use it for Native or Canva AI designs.');}catch(e){setMessage('Theme could not be saved: '+String(e))}};
 const fetchCanvaLibrary=async(next=false)=>{if(!canvaSession){onConnect();setMessage('Connect the selected Canva account first.');return;}setLoadingLibrary(true);try{const q=next&&canvaContinuation?'?continuation='+encodeURIComponent(canvaContinuation):'';const data=await canvaApi('theme-designs'+q);setCanvaLibrary(old=>next?[...old,...(data.items||[])]:data.items||[]);setCanvaContinuation(data.continuation||null);setMessage('Canva designs loaded. Select a design to save it as a visual reference (not as the background).');}catch(e){setMessage('Unable to list Canva designs: '+String(e))}finally{setLoadingLibrary(false)}};
 const importCanvaTheme=async(item:CanvaLibraryItem,extraNotes='')=>{try{
   // Canva doesn't expose the original text/shape layers to this Native editor.
   // Keep its preview for visual guidance; never use the rendered slide as a background.
   const t:Theme={id:crypto.randomUUID(),name:item.title||'Canva inspired theme',type:'gradient',colors:[...design.theme.colors] as [string,string],accent:design.theme.accent,foreground:design.theme.foreground,font:design.theme.font,layout:design.theme.layout,referenceImage:item.thumbnail||undefined,source:'ai',canvaDesignId:item.id,styleNotes:`Inspired by the Canva design "${item.title||'Untitled'}". ${extraNotes} Match the mood, colors and typography where possible. Keep the new event content accurate; avoid copying reference text.`,layouts:structuredClone(layoutDefaults)};
   await putTheme(t);await refreshThemeList();choose(t);setThemeSource('local');setMessage('AI reference theme saved. It is available for Canva AI generation only. Its original Canva artwork will never become a Native background.');
  }catch(e){setMessage('Could not save Canva reference: '+String(e))}};
 const saveAITheme=async(v?:CanvaVersion)=>{const selected=v||currentAI;if(!selected){setMessage('Generate an AI concept first.');return;}await importCanvaTheme({id:selected.id,title:(themeName.trim()||selected.title)+' · AI theme',thumbnail:selected.preview,editUrl:selected.editUrl},`Design direction: ${themePrompt||'coordinated church visual identity'}. AI instructions: ${aiInstructions}. Reference layouts: title slide, section divider, announcement, invitation and typography/color study if present in the generated Canva design.`);};
 const generateCanva=async()=>{
  if(!canvaSession){onConnect();setMessage('Connect Canva, then generate your design.');return;}
  setBusy(true);setMessage('Creating a Canva AI 16:9 presentation design...');
  try{
   const baseStyle=`${themePrompt}. Selected theme: ${design.theme.name}. Style notes: ${design.theme.styleNotes||'none'}. Theme source: ${design.theme.source||'native'}. Colors: ${design.theme.colors.join(', ')}. Typeface mood: ${design.theme.font}. Layout: ${design.theme.layout}. ${design.theme.canvaDesignId?'The reference Canva design ID is '+design.theme.canvaDesignId+'. This ID is a reference only: the generation endpoint does not ingest it as visual input. Follow the saved style notes rather than claiming an exact clone.':''}`;
   const started=await canvaApi('design-generate','POST',{kind:tab==='themes'?'visual theme concept':tab,title:tab==='themes'?'Church visual identity — background study':design.title||'Church worship design',subtitle:tab==='themes'?'':design.subtitle,body:tab==='themes'?'':design.body,date:tab==='themes'?'':dateText(design.date),time:tab==='themes'?'':timeText(design.time),venue:tab==='themes'?'':design.venue,address:tab==='themes'?'':design.address,footer:tab==='themes'?'':design.footer,style:baseStyle,instructions:tab==='themes'?`${aiInstructions}. Generate a coordinated MULTI-SLIDE VISUAL REFERENCE KIT if the Canva generator supports it: a title layout, section layout, announcement layout, invitation layout, and typography/color reference page. Include coherent styling on every slide. These are references, not reusable editable Native templates. Avoid actual event details. If the API returns only one page, PresCreator will save only that reference; do not imply the other layouts exist.`:aiInstructions});
   setMessage('Canva is generating the concept. This may take a minute...');
   const done=await poll('generation-status?job='+encodeURIComponent(started.jobId),140);
   if(!done.designId)throw Error('Design completed without a design ID. Check Canva Projects.');
   const version:CanvaVersion={id:done.designId,preview:'',editUrl:done.editUrl||'https://www.canva.com/projects',title:design.title||'Untitled',created:Date.now()};
   setAiVersions(v=>[version,...v].slice(0,12));setAiIndex(0);setPreviewKey('ai:'+version.id);
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
  if(isAITheme(design.theme)){setMessage('AI reference themes cannot export Native artwork. Use Generate with Canva AI, or choose a Native theme.');return;}
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
 const patchTheme=(p:Partial<Theme>)=>setDesign(d=>({...d,theme:{...normalizeTheme(d.theme),...p},updated:Date.now()}));
 const patchLayout=(key:LayoutName,p:Partial<LayoutConfig>)=>setDesign(d=>{const t=normalizeTheme(d.theme);return {...d,theme:{...t,layouts:{...t.layouts,[key]:{...themeLayout(t,key),...p}}},updated:Date.now()}});
 const choose=(theme:Theme)=>{setSelected(theme.id);patch({theme:normalizeTheme(theme)});setPreviewKey('live');setMessage(isAITheme(theme)?'AI reference selected. Your content is preserved. Generate with Canva AI to use its saved style guidance.':'Native theme selected. Your content is preserved; you can generate Native or Canva AI designs.');};
 const selectTab=(out:Output|'themes')=>{setTab(out);if(out!=='themes'){patch({output:out,blank:false,orientation:out==='poster'||out==='invite'?'portrait':'landscape'});setPreviewKey('live');}};
 const createOptions=()=>{const q=themePrompt.toLowerCase();const base=q.match(/flower|floral|rose|pink/)?defaultThemes[4]:q.match(/green|nature|forest|earth/)?defaultThemes[2]:q.match(/youth|neon|bold/)?defaultThemes[5]:q.match(/warm|beige|cream|minimal/)?defaultThemes[0]:q.match(/purple|modern|worship/)?defaultThemes[3]:defaultThemes[1];const rotation=defaultThemes.map((t,i)=>({...t,id:'variant-'+Date.now()+'-'+i,colors:i===0?base.colors:i%2===0?[t.colors[1],t.colors[0]] as [string,string]:t.colors,layout:(['center','left','frame'] as const)[i%3],name:i===0?base.name+' · from prompt':t.name}));setIdeas(rotation);setShowPresetOptions(true);setMessage('Optional preset suggestions refreshed. Pick one or continue with your own colors and layouts.');};
 const generateNative=()=>{
  if(isAITheme(design.theme)){setMessage('This is an AI reference theme. Choose a Native theme to generate an editable Native design. Your content will be preserved.');return;}
  const snapshot:Design=structuredClone({...design,theme:normalizeTheme(design.theme),updated:Date.now()});
  const v:NativeVersion={id:crypto.randomUUID(),design:snapshot,created:Date.now()};
  setNativeVersions(prev=>[v,...prev].slice(0,20));
  setPreviewKey('native:'+v.id);
  setMessage('Native version generated. Your fields remain editable; select Live edit to continue changing them.');
 };
 const generateAIFromEditor=()=>{void generateCanva();};
 const upload=async(file?:File)=>{if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setMessage('Use a PNG, JPEG, or WebP image smaller than 2 MB.');return;}const reader=new FileReader();reader.onload=()=>patchTheme({type:'image',background:String(reader.result)});reader.readAsDataURL(file)};
 const doSave=async()=>{setBusy(true);try{await saveDesign(design);setSaved(await getDesigns());setMessage('Design saved locally on this device.')}catch(e){setMessage('Save failed: '+String(e))}finally{setBusy(false)}};
 const exportImage=async()=>{if(isAITheme(design.theme)){setMessage('AI reference themes are for Canva AI designs only. Open or export the generated result in Canva.');return;}setBusy(true);try{const image=await renderPng(design);saveBlob(image,(design.title||'prescreator-design').replace(/[^\w-]+/g,'-')+'.png');setMessage('PNG downloaded.')}catch(e){setMessage(String(e))}finally{setBusy(false)}};
 const useSaved=(d:Design)=>{setDesign({...structuredClone(d),theme:normalizeTheme(d.theme)});setTab(d.output);setSelected(d.theme.id);setMessage('Saved design loaded.');};
 const copyDesign=()=>{setDesign(d=>({...structuredClone(d),id:crypto.randomUUID(),name:d.name+' (copy)',updated:Date.now()}));setMessage('New copy created.');};
 return <div className="ds-workspace">
  <div className="ds-tabs"><button className={tab==='themes'?'active':''} onClick={()=>setTab('themes')}>Theme Studio</button><button className={tab==='title'||tab==='section'?'active':''} onClick={()=>selectTab('title')}>Slide Maker</button><button className={tab==='invite'?'active':''} onClick={()=>selectTab('invite')}>E-Invite Maker</button><button className={tab==='announcement'?'active':''} onClick={()=>selectTab('announcement')}>Announcement Maker</button></div>
  {message&&<div className="ds-notice" role="status"><Info size={15}/>{message}<button onClick={()=>setMessage('')}>×</button></div>}
  {isThemeStudio&&<div className="ds-mode"><div className="ds-modeswitch"><button className={source==='native'?'selected':''} onClick={()=>setSource('native')}>Native concepts</button><button className={source==='ai'?'selected':''} onClick={()=>setSource('ai')}>Canva AI concepts</button></div><span>Native themes produce editable Native layouts and can guide AI. AI themes are reference-only for Canva AI generation; Native output is unavailable with them.</span></div>}<div className="ds-layout"><section className="ds-panel">
   {tab==='themes'?<><h2>Theme Studio</h2><p>{source==='native'?'Create an editable Native theme pack. Use it in Native editors or as Canva AI styling guidance.':'Generate or import Canva AI design references. Save them as an AI theme for future AI generations only; they will not become Native backgrounds.'}</p>
   <label>Theme name</label><input value={themeName} onChange={e=>setThemeName(e.target.value)} placeholder="e.g. Bountiful Life"/>
   <label>Style / color direction (optional)</label><input aria-label="Design direction" value={themePrompt} placeholder="e.g. warm beige, botanical, minimalist" onChange={e=>setThemePrompt(e.target.value)}/>
   {source==='native'&&<><div className="ds-fieldgrid"><div><label>Primary background</label><input type="color" value={design.theme.colors[0]} onChange={e=>patchTheme({type:'gradient',colors:[e.target.value,design.theme.colors[1]]})}/></div><div><label>Secondary background</label><input type="color" value={design.theme.colors[1]} onChange={e=>patchTheme({type:'gradient',colors:[design.theme.colors[0],e.target.value]})}/></div><div><label>Text</label><input type="color" value={design.theme.foreground} onChange={e=>patchTheme({foreground:e.target.value})}/></div><div><label>Accent</label><input type="color" value={design.theme.accent} onChange={e=>patchTheme({accent:e.target.value})}/></div></div>
   <label>Heading font</label><select value={design.theme.font} onChange={e=>patchTheme({font:e.target.value})}>{['Arial, sans-serif','Arial Black, sans-serif','Georgia, serif','Times New Roman, serif','Verdana, sans-serif','Trebuchet MS, sans-serif','Impact, sans-serif'].map(font=><option key={font} value={font}>{font.split(',')[0]}</option>)}</select>
   <details open={showPresetOptions} onToggle={e=>setShowPresetOptions(e.currentTarget.open)}><summary>Optional native theme presets</summary><p className="ds-help">You can ignore these. They only fill in suggested colors and fonts.</p><button className="ds-btn secondary" onClick={createOptions}><RefreshCw size={15}/> Suggest from style keywords</button><div className="ds-themegrid">{ideas.map(t=><button key={t.id} className={'ds-theme '+(selected===t.id?'selected':'')} onClick={()=>choose(t)}><span style={{background:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})`,color:t.foreground,fontFamily:t.font}}>{t.name}</span><b>{t.name}</b></button>)}</div></details>
   <h3>Layouts included in this theme</h3><p className="ds-help">Each output has its own layout, without any fixed title or event text. Edit the layout here; each creator will use its matching layout.</p>
   {(['title','section','invite','announcement','blank'] as LayoutName[]).map(key=><div key={key} className="ds-layout-config"><strong>{key==='invite'?'E-Invite':key==='blank'?'Blank slide':key==='title'?'Title slide':key==='section'?'Section slide':'Announcement'}</strong><div className="ds-fieldgrid"><div><label>Text placement</label><select value={themeLayout(design.theme,key).alignment} onChange={e=>patchLayout(key,{alignment:e.target.value as LayoutConfig['alignment']})}><option value="center">Centered</option><option value="left">Left</option><option value="frame">Framed / centered</option></select></div><div><label>Title size</label><select value={themeLayout(design.theme,key).titleScale} onChange={e=>patchLayout(key,{titleScale:Number(e.target.value)})}><option value={0.7}>Small</option><option value={0.8}>Medium</option><option value={0.85}>Medium large</option><option value={0.86}>Section</option><option value={1}>Large</option><option value={1.15}>Extra large</option></select></div><div><label>Decorative style</label><select value={themeLayout(design.theme,key).accentStyle} onChange={e=>patchLayout(key,{accentStyle:e.target.value as LayoutConfig['accentStyle']})}><option value="none">None</option><option value="line">Subtle</option><option value="frame">Frame</option></select></div></div></div>)}
   {design.theme.referenceImage&&<div className="ds-reference"><strong>Canva inspiration only — not the background</strong><img src={design.theme.referenceImage} alt="Theme visual reference"/><small>The Canva image is for inspiration. Its text and other finished elements are not copied onto your slide.</small></div>}
   <button className="ds-btn primary" onClick={saveCurrentTheme}><Save size={14}/> Save Native theme pack</button></>}
   <h3>Theme Library</h3><div className="ds-mode ds-smalltabs"><div className="ds-modeswitch"><button className={themeSource==='local'?'selected':''} onClick={()=>setThemeSource('local')}>Local Themes</button><button className={themeSource==='canva'?'selected':''} onClick={()=>setThemeSource('canva')}>My Canva Designs</button></div></div>
   {themeSource==='local'?<><div className="ds-fieldgrid"><div><label>Theme name</label><input value={themeName} onChange={e=>setThemeName(e.target.value)} placeholder="e.g. Sunday Beige"/></div><button className="ds-btn secondary ds-save-theme" onClick={saveCurrentTheme}><Save size={14}/> Save current theme</button></div><div className="ds-themegrid">{themes.map(t=><div key={t.id} className="ds-theme-entry"><button className={'ds-theme '+(selected===t.id?'selected':'')} onClick={()=>choose(t)}><span style={{background:normalizeTheme(t).type==='solid'?t.colors[0]:`linear-gradient(135deg,${t.colors.join(',')})`,color:t.foreground}}>{isAITheme(t)?'AI':'Aa'}</span><b>{t.name} · {isAITheme(t)?'AI reference':'Native'}</b></button><button className="ds-theme-delete" title="Delete local theme" onClick={async()=>{await removeTheme(t.id);await refreshThemeList();}}><Trash2 size={13}/></button></div>)}</div>{!themes.length&&<small>No saved themes yet. Save your current theme or import one from Canva.</small>}</>:
   <><div className="ds-actions"><button className="ds-btn secondary" disabled={loadingLibrary} onClick={()=>fetchCanvaLibrary(false)}><RefreshCw size={14}/>{loadingLibrary?'Loading...':'Load Canva designs'}</button></div><label>Search loaded designs</label><input value={canvaFilter} onChange={e=>setCanvaFilter(e.target.value)} placeholder="Search by design title"/><div className="ds-themegrid">{canvaLibrary.filter(item=>item.title.toLowerCase().includes(canvaFilter.toLowerCase())).map(item=><div className="ds-canva-theme" key={item.id}>{item.thumbnail?<img src={item.thumbnail} alt="Canva design preview" loading="lazy"/>:<div className="ds-no-thumb">No thumbnail</div>}<strong>{item.title}</strong><div className="ds-actions"><button className="ds-btn secondary" disabled={busy} onClick={()=>importCanvaTheme(item)}>Use as theme</button>{item.editUrl&&<a className="ds-btn secondary" href={item.editUrl} target="_blank" rel="noreferrer">Open</a>}</div></div>)}</div>{canvaContinuation&&<button className="ds-btn secondary" disabled={loadingLibrary} onClick={()=>fetchCanvaLibrary(true)}>Load more</button>}<small className="ds-help">Canva designs are imported as visual references, never completed-slide backgrounds. Native layouts remain text-editable. Fonts and colors from Canva are not automatically extractable.</small></>}
   <div className="ds-actions">{(['title','invite','announcement'] as Output[]).map(t=><button className="ds-btn secondary" key={t} onClick={()=>selectTab(t)}><Plus size={14}/> {t==='title'?'Slide Maker':t==='invite'?'E-Invite Maker':'Announcement Maker'}</button>)}</div></>:
   <><div className="ds-current-theme"><div className="ds-theme-swatch" style={{background:normalizeTheme(design.theme).type==='solid'?design.theme.colors[0]:`linear-gradient(135deg,${design.theme.colors[0]},${design.theme.colors[1]})`}}/><div><small>ACTIVE THEME · {aiThemeSelected?'AI REFERENCE':'NATIVE'}</small><strong>{design.theme.name}</strong><small>{aiThemeSelected?'Canva AI generation only · Native editing unavailable for this theme':design.theme.styleNotes||'Editable Native layouts and optional Canva AI styling guidance'}</small></div><button className="ds-btn secondary" onClick={()=>setTab('themes')}>Change</button></div><h2>{tab==='title'||tab==='section'?'Slide Maker':tab==='invite'?'E-Invite Maker':'Announcement Maker'}</h2><p>{tab==='title'||tab==='section'?'Create blank, title or section slides using one theme.':tab==='announcement'?'A clear slide for church announcements.':'An invitation with event date, time, and location.'}</p>
    {(tab==='title'||tab==='section')&&<><label>Slide type</label><select value={design.blank?'blank':tab==='section'?'section':'title'} onChange={e=>{const val=e.target.value;const output=val==='section'?'section':'title';setTab(output);patch({output,blank:val==='blank'});setPreviewKey('live');}}><option value="blank">Blank slide</option><option value="title">Title slide</option><option value="section">Section divider</option></select></>}
    
    <label>Design name</label><input value={design.name} onChange={e=>patch({name:e.target.value})}/>
    <label>Main title</label><input value={design.title} onChange={e=>patch({title:e.target.value})}/>
    <div className="ds-quick">{tab==='section'?['Praise and Worship','Teaching','Announcements','Prayer','Welcome','Offering'].map(s=><button key={s} onClick={()=>patch({title:s})}>{s}</button>):tab==='announcement'?['Announcements','Life Groups','Sunday Service','Upcoming Events'].map(s=><button key={s} onClick={()=>patch({title:s})}>{s}</button>):null}</div>
    <label>Subtitle (optional)</label><input value={design.subtitle} onChange={e=>patch({subtitle:e.target.value})}/>
    {(tab==='poster'||tab==='invite'||tab==='announcement')&&<><label>Description / announcement details</label><textarea rows={3} value={design.body} onChange={e=>patch({body:e.target.value})}/><div className="ds-fieldgrid"><div><label>Date</label><input type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(design.date)?design.date:""} onChange={e=>patch({date:e.target.value})}/>{design.date&&!/^\d{4}-\d{2}-\d{2}$/.test(design.date)&&<small className="ds-help">Previous custom date: {design.date}. Pick a date to replace it.</small>}</div><div><label>Time</label><input type="time" value={/^([01]\d|2[0-3]):[0-5]\d$/.test(design.time)?design.time:""} onChange={e=>patch({time:e.target.value})}/>{design.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(design.time)&&<small className="ds-help">Previous custom time: {design.time}. Pick a time to replace it.</small>}</div></div><label>Venue</label><input value={design.venue} onChange={e=>patch({venue:e.target.value})}/><label>Address</label><input value={design.address} onChange={e=>patch({address:e.target.value})}/></>}
    <label>Footer (optional)</label><input value={design.footer} onChange={e=>patch({footer:e.target.value})}/>
    <label>Format</label><select value={design.orientation} onChange={e=>patch({orientation:e.target.value as Orientation})}><option value="landscape">16:9 Landscape</option><option value="portrait">Portrait</option><option value="square">Square</option></select>
    <label>Theme</label><select value={design.theme.id} onChange={e=>{const th=[...ideas,...themes].find(x=>x.id===e.target.value);if(th)choose(th)}}>{![...ideas,...themes].some(t=>t.id===design.theme.id)&&<option value={design.theme.id}>{design.theme.name}</option>}{[...ideas,...themes].map(th=><option key={th.id} value={th.id}>{th.name}{isAITheme(th)?' · AI reference':' · Native'}</option>)}</select><button className="ds-btn secondary" onClick={()=>setTab('themes')}><FolderOpen size={14}/> Browse Theme Library</button>
    {!aiThemeSelected&&<><label>Background mode</label><select value={design.theme.type} onChange={e=>patchTheme({type:e.target.value as Theme['type']})}><option value="gradient">Gradient</option><option value="solid">Solid color</option><option value="image">Uploaded image</option></select>
    {design.theme.type!=='image'?<div className="ds-fieldgrid"><div><label>Color 1</label><input type="color" value={design.theme.colors[0]} onChange={e=>patchTheme({colors:[e.target.value,design.theme.colors[1]]})}/></div>{design.theme.type==='gradient'&&<div><label>Color 2</label><input type="color" value={design.theme.colors[1]} onChange={e=>patchTheme({colors:[design.theme.colors[0],e.target.value]})}/></div>}</div>:<><input ref={fileRef} style={{display:'none'}} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])}/><button className="ds-btn secondary" onClick={()=>fileRef.current?.click()}><ImagePlus size={14}/> Upload background</button></>}
    <div className="ds-fieldgrid"><div><label>Text color</label><input type="color" value={design.theme.foreground} onChange={e=>patchTheme({foreground:e.target.value})}/></div><div><label>Accent color</label><input type="color" value={design.theme.accent} onChange={e=>patchTheme({accent:e.target.value})}/></div></div>
    <label>Font</label><select value={design.theme.font} onChange={e=>patchTheme({font:e.target.value})}>{['Arial, sans-serif','Arial Black, sans-serif','Georgia, serif','Times New Roman, serif','Verdana, sans-serif','Trebuchet MS, sans-serif','Impact, sans-serif'].map(font=><option key={font} value={font}>{font.split(',')[0]}</option>)}</select>
    <label>Layout</label><select value={design.theme.layout} onChange={e=>patchTheme({layout:e.target.value as Theme['layout']})}><option value="center">Centered</option><option value="left">Left aligned</option><option value="frame">Elegant frame</option></select>
    <div className="ds-actions"><button className="ds-btn secondary" onClick={saveCurrentTheme}><Save size={14}/> Save theme</button><button className="ds-btn primary" onClick={doSave} disabled={busy}><Save size={15}/> Save locally</button><button className="ds-btn secondary" onClick={exportImage} disabled={busy}><Download size={15}/> Download PNG</button><button className="ds-btn secondary" onClick={copyDesign}><Copy size={15}/> Duplicate</button></div></>}
    {aiThemeSelected&&<div className="ds-ai-only"><strong>AI reference theme</strong><p>Use Generate with Canva AI below. All titles, dates, times and venue details remain editable. To make an editable Native design, switch to a Native theme; your content won't be cleared.</p>{design.theme.referenceImage&&<img src={design.theme.referenceImage} alt="Selected Canva reference"/>}</div>}
   </>}
   <div className="ds-canva-panel">
     <h3><Cloud size={17}/> Canva connection</h3>
     <select value={canvaAccount} onChange={e=>onAccountChange(e.target.value as '1'|'2')}>{(['1','2'] as const).map(id=><option key={id} value={id}>{canvaNames[id]||'Canva account '+id}{canvaSessions[id]?' (connected)':''}</option>)}</select>
     {!canvaSession&&<button className="ds-btn secondary" onClick={()=>onConnect()}>Connect Canva</button>}
     {isThemeStudio ? <>
       {source==='ai'&&<><label>Additional AI theme instructions</label><textarea rows={3} value={aiInstructions} onChange={e=>setAiInstructions(e.target.value)} placeholder="A consistent floral theme with coordinated colors and background artwork"/><button className="ds-btn primary" disabled={busy} onClick={generateCanva}><Sparkles size={15}/>{busy?'Generating...':'Generate theme concept with Canva AI'}</button></>}
       <small className="ds-help">AI results are inspiration references, not reusable background images. Native layouts and editable text are created separately.</small>
     </> : <>
       <details open={aiDetailsOpen} onToggle={e=>setAiDetailsOpen(e.currentTarget.open)} className="ds-ai-details"><summary><Sparkles size={15}/> Additional AI instructions (optional)</summary><textarea rows={3} value={aiInstructions} onChange={e=>setAiInstructions(e.target.value)} placeholder="Make it elegant and minimalist; use subtle botanical accents. Keep all event details accurate."/><small className="ds-help">The selected theme, fonts, colors and all current details are included automatically.</small></details>
       <div className="ds-generator-actions"><button className="ds-btn secondary" disabled={busy||aiThemeSelected} title={aiThemeSelected?'Choose a Native theme to enable Native generation':'Generate an editable Native design'} onClick={generateNative}><Plus size={15}/> Generate Native</button><button className="ds-btn primary" disabled={busy} onClick={generateAIFromEditor}><Sparkles size={15}/>{busy?'Generating...':aiVersions.length?'Redesign with Canva AI':'Generate with Canva AI'}</button></div>
       <small className="ds-help">{aiThemeSelected?'AI theme selected: only Canva AI generation is available. The selected theme provides saved text-based style guidance, not exact image conditioning.':'Native themes work with both Native and Canva AI generation. AI versions remain separate and may vary.'}</small>
       <div className="ds-actions"><button className="ds-btn secondary" onClick={()=>onConnect(true)} disabled={busy}>Authorize image upload</button><button className="ds-btn secondary" disabled={busy||aiThemeSelected} onClick={saveToCanva}><Cloud size={15}/> Save Native to Canva</button>{savedCanvaUrl&&<a className="ds-btn secondary" href={savedCanvaUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open saved design</a>}</div>
     </>}
   </div>
  </section><section className="ds-preview">
    <div className="ds-previewhead"><div><h2>{isThemeStudio?'Theme preview':'Design preview & versions'}</h2><small>{showAiPreview?'Canva AI design — view or edit in Canva':aiThemeSelected?'AI theme visual reference — no Native output':selectedNative?'Saved Native snapshot':'Live editable Native design'}</small></div><div className="ds-actions"><button className="ds-btn secondary" onClick={()=>setPreviewKey('live')}>Live edit</button><button className="ds-btn secondary" disabled={busy||aiThemeSelected} onClick={exportImage}><Download size={15}/> Export current Native PNG</button></div></div>
    <div className="ds-stage">{showAiPreview?(selectedAI?.preview?<img className="ds-ai-preview" src={selectedAI.preview} alt="Canva AI design"/>:<div className="ds-ai-empty">Canva created a design but no preview is available. <a href={selectedAI?.editUrl} target="_blank" rel="noreferrer">Open in Canva</a></div>):isThemeStudio&&source==='ai'&&currentAI?.preview?<img className="ds-ai-preview" src={currentAI.preview} alt="Canva theme concept"/>:aiThemeSelected&&design.theme.referenceImage?<div className="ds-ai-reference-preview"><img src={design.theme.referenceImage} alt="AI theme visual reference (not a generated slide)"/><small>AI theme reference only. Click Generate with Canva AI to create a new design from your entered content.</small></div>:aiThemeSelected?<div className="ds-ai-empty">AI theme selected. Enter details and click Generate with Canva AI to create a design.</div>:<SlideArtwork design={previewDesign}/>}</div>
    <div className="ds-version-panel"><div className="ds-version-heading"><h3>Versions</h3><small>Switch versions without losing your Native working copy</small></div><div className="ds-version-list"><button className={previewKey==='live'?'ds-version-active':''} onClick={()=>setPreviewKey('live')}>{aiThemeSelected?'Theme reference':'Live Native'}</button>{nativeVersions.map(v=><button key={v.id} className={previewKey==='native:'+v.id?'ds-version-active':''} onClick={()=>setPreviewKey('native:'+v.id)}>Native · {new Date(v.created).toLocaleTimeString()}</button>)}{aiVersions.map(v=><button key={v.id} className={previewKey==='ai:'+v.id?'ds-version-active':''} onClick={()=>setPreviewKey('ai:'+v.id)}>AI · {new Date(v.created).toLocaleTimeString()}</button>)}</div>
      {selectedNative&&<button className="ds-btn secondary" onClick={()=>{setDesign(structuredClone(selectedNative.design));setTab(selectedNative.design.output);setPreviewKey('live');setMessage('Native version restored to the editor.');}}>Restore this Native version</button>}
      {selectedAI&&<a className="ds-btn primary" href={selectedAI.editUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Edit in Canva</a>}
      {selectedAI&&<button className="ds-btn secondary" disabled={busy} onClick={()=>{void saveAITheme(selectedAI);}}><Save size={14}/> Save AI design as theme reference</button>}
    </div>
    <p className="ds-muted">Native layouts preserve editable text. Canva AI generations are returned as presentation designs; their output may vary and is edited in Canva. PNG export and Save Native to Canva use the current Native working design.</p>
    <h3>Saved designs</h3>{saved.length?<div className="ds-saved">{saved.map(d=><div key={d.id} className="ds-saveditem"><button onClick={()=>{useSaved(d);setPreviewKey('live');}}><SlideArtwork mini design={d}/><span>{d.name}<small>{d.output} · {new Date(d.updated).toLocaleDateString()}</small></span></button><button aria-label="Delete saved design" title="Delete" onClick={async()=>{await deleteDesign(d.id);setSaved(await getDesigns())}}><Trash2 size={16}/></button></div>)}</div>:<p className="ds-muted">No saved designs yet. Use Save locally to keep an editable Native design on this device.</p>}
    <div className="ds-footerinfo"><Check size={14}/> Local-first: Native designs do not require Canva or Cloudflare storage.</div>
  </section></div>
 </div>
}
