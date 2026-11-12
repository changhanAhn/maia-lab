/* Development by work layer: five research areas (columns) across four work layers (rows),
   drawn from one daily snapshot (activity.json). No drill-down, no polling. */
(function(){
'use strict';
const L=window.LAB, tr=a=>L.T(...a), $=id=>document.getElementById(id);
const GROUPS={focus:['지금 주목할 일','Current focus','現在の重点','当前重点'],research:['연구·개발','Research & development','研究・開発','研究与开发'],papers:['논문','Papers','論文','论文'],grants:['연구과제','Applications','研究課題','科研项目'],support:['연구지원','Research support','研究支援','研究支持']};
let board=null,boardFailed=false,loading=false;
let P=window.PULSE,reloadFailed=false;
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function validPulse(p){return p&&p.schema_version===2&&p.commits&&p.period
 &&[p.commits.total,p.commits.day,p.commits.week].every(n=>Number.isFinite(n)&&n>=0)
 &&Array.isArray(p.commits.spark14)&&p.commits.spark14.length===14&&p.commits.spark14.every(n=>Number.isFinite(n)&&n>=0)
 &&Number.isFinite(Date.parse(p.generated_at))&&Number.isFinite(Date.parse(p.period.end))}
if(!validPulse(P))P=null;
function validBoard(b){
 if(!b||b.schema_version!==1||!Array.isArray(b.cards)||!Array.isArray(b.events)||!Array.isArray(b.focus)
  ||!Number.isFinite(Date.parse(b.generated_at))||!Number.isFinite(Date.parse(b.content_updated_at))
  ||Date.parse(b.generated_at)>Date.now()+60000||Date.parse(b.content_updated_at)>Date.parse(b.generated_at)
  ||!/^([a-f0-9]{40})$/.test(b.source_revision)||typeof b.content_hash!=='string')return false;
 const text=a=>Array.isArray(a)&&a.length===4&&a.every(s=>typeof s==='string'&&s.length>0);
 const safe=h=>typeof h==='string'&&/^(record|grants|research-[a-z-]+)\.html(?:#[A-Za-z0-9_-]+)?$/.test(h);
 const w=b.work;if(!w||!Array.isArray(w.topics)||!Array.isArray(w.entries)||!Number.isFinite(Date.parse(w.collected_at)))return false;
 const topicIds=new Set();for(const t of w.topics){if(!t||typeof t.id!=='string'||topicIds.has(t.id)||!text(t.name)||!Number.isInteger(t.pending)||t.pending<0||(t.last_at!==null&&!Number.isFinite(Date.parse(t.last_at))))return false;topicIds.add(t.id)}
 if(!w.entries.every(e=>e&&topicIds.has(e.topic)&&Number.isFinite(Date.parse(e.at))&&Array.isArray(e.kinds)&&e.kinds.length&&e.kinds.every(k=>['code','data','document','figure'].includes(k))&&Number.isInteger(e.files)&&e.files>0))return false;
 const ids=new Set();
 for(const c of b.cards){if(!c||typeof c.id!=='string'||ids.has(c.id)||!GROUPS[c.group]||c.group==='focus'
  ||!['name','now','last'].every(k=>text(c[k]))||!safe(c.href)||typeof c.fingerprint!=='string')return false;ids.add(c.id)}
 if(new Set(b.focus).size!==b.focus.length||!b.focus.every(id=>ids.has(id)))return false;
 return b.events.every(e=>e&&ids.has(e.id)&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&text(e.name)&&text(e.text)&&safe(e.href));
}

/* Where each public item sits. 'c:' is a card of activity.json, 't:' a work topic.
   An item that is not placed here is not drawn; tools/check_development.py fails on any
   research or paper card left out, so a new card gets a deliberate place. */
const AREAS=[
 {id:'A',w:196,sub:['MAIA 지수 · 비보상 관문','MAIA index · gate contract','MAIA指数・非補償ゲート','MAIA指数 · 非补偿门控'],
  tool:['t:maia','t:hari'],papers:['maia-index','hari']},
 {id:'B',w:294,sub:['인라인·반복 검사 · 래더 · 시험 라인','Inline and repeat inspection · ladder · test line','インライン・反復検査・ラダー・試験ライン','在线与重复检测 · 梯形图 · 试验线'],
  field:['c:research-B-3'],tool:['t:ladder','t:runtime','t:inline','t:repeat','t:cellcontract'],meas:['c:AMAZON-ARA-FALL2026','t:amazon'],
  papers:['inline','repeat','ladder','sttt','cellcontract'],dataset:true},
 {id:'C',w:222,sub:['마이크로그리드 EMS · PV/ESS','Microgrid EMS · PV/ESS','マイクログリッドEMS・PV/ESS','微电网EMS · PV/ESS'],
  tool:['t:energy','t:dcfault','c:research-C-3','c:research-C-4','c:research-C-5'],meas:['c:research-C-1','c:research-C-2'],papers:['energy']},
 {id:'D',w:148,sub:['공정 이벤트 동기 전력','Event-synced power','工程イベント同期電力','工序事件同步电力'],tool:['c:research-D-0']},
 {id:'E',w:152,sub:['PLC · 비전 · 데이터 실습','PLC · vision · data','PLC・ビジョン・データ実習','PLC · 视觉 · 数据实训'],field:['c:research-E-0','c:research-E-2'],papers:['research-E-3','research-E-4','research-E-5']}
];
const TOPIC_AREA={ladder:'B',inline:'B',repeat:'B',runtime:'B',amazon:'B',cellcontract:'B',maia:'A',hari:'A',energy:'C',dcfault:'C'};
const BANDS=[
 {id:'field',name:['현장·운영','On site','現場・運用','现场与运行'],sub:['설비·실습 운영','Equipment and classes in use','設備・実習の運用','设备与实训运行']},
 {id:'tool',name:['코드·도구','Code & tools','コード・ツール','代码与工具'],sub:['바뀌는 코드·자료','Code and data in change','更新中のコード・資料','修改中的代码与资料']},
 {id:'meas',name:['실측·분석','Measurement','実測・分析','实测与分析'],sub:['측정·해석 중','Measuring, analysing','計測・解析中','测量与分析中']},
 {id:'open',name:['성과·공개','Outputs','成果・公開','成果与公开'],sub:['논문·데이터·수상','Papers, data, awards','論文・データ・受賞','论文、数据与获奖']}
];
// Published dataset facts, as stated on data.html (#d-repeat, #d-inline, #d-ladder).
const DATASET={cells:31,
 text:['셀 31 · 회차 3 · 라벨 956 · 시험 231 / 개발 143 이미지','Cells 31 · rounds 3 · labels 956 · images 231 test / 143 dev','セル31・3回・ラベル956・画像 試験231 / 開発143','电芯31 · 3轮 · 标签956 · 图像 试验231 / 开发143'],
 scope:['공개 데이터셋 규모 · 실라인 계측 10.15 · PLC 로그 10.17','Published dataset · line data 10.15 · PLC log 10.17','公開データの規模・実ライン計測10.15・PLCログ10.17','已公开数据集规模 · 产线实测10.15 · PLC日志10.17']};
const KIND={code:['코드','Code','コード','代码'],data:['자료','Data','データ','数据'],document:['문서','Docs','文書','文档'],figure:['그림','Figures','図','图']};
const T={
 editing:n=>tr(['수정 중 '+n,n+' in edit','編集中 '+n,'修改中 '+n]),
 logged:['기록 ','Logged ','記録 ','记录 '],
 cols:['위: 연구영역','Top: research area','上: 研究領域','上方: 研究方向'],
 rows:['왼쪽: 작업 층','Left: work layer','左: 作業層','左侧: 工作层'],
 has:['항목 있음','Has items','項目あり','有条目'],
 none:['등록 항목 없음','None listed','登録項目なし','无登记条目'],
 focus:['주요 항목','Focus item','重点項目','重点条目'],
 paper:['논문 상태','Paper status','論文の状況','论文状态'],
 changes:['기록된 변경','Recorded changes','記録された変更','已记录的修改'],
 latest:['최근 기록일 ','Latest day ','最新記録日 ','最近记录日 '],
 noRecord:['14일 내 기록 없음','No record in 14 days','14日以内の記録なし','14天内无记录'],
 title:['연구영역 다섯 개와 작업 층 네 개에 놓인 연구 항목, 그리고 저장소에 기록된 변경','Research items placed by five areas and four work layers, with the changes recorded in the repository','5つの研究領域と4つの作業層に置いた研究項目と、リポジトリに記録された変更','按五个研究方向与四个工作层排列的研究条目，以及仓库中记录的修改']
};

const KST=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
function kst(t){const o={};KST.formatToParts(new Date(t)).forEach(p=>o[p.type]=p.value);if(o.hour==='24')o.hour='00';return o}
const md=t=>{const o=kst(t);return o.month+'.'+o.day};
const hm=t=>{const o=kst(t);return o.month+'.'+o.day+' '+o.hour+':'+o.minute};
const day=t=>{const o=kst(t);return o.year+o.month+o.day};
const stamp=iso=>new Intl.DateTimeFormat({ko:'ko-KR',en:'en-GB',ja:'ja-JP',zh:'zh-CN'}[L.lang()],{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso));

/* One model feeds both the desktop diagram and the stacked phone list. */
function model(){
 const w=board.work,C=new Map(board.cards.map(c=>[c.id,c])),TP=new Map(w.topics.map(t=>[t.id,t])),F=new Set(board.focus);
 const latest=w.entries.reduce((m,e)=>Math.max(m,Date.parse(e.at)),0),lastDay=latest?day(latest):'';
 const hot=new Set(w.entries.filter(e=>day(e.at)===lastDay).map(e=>e.topic));
 const lastKinds=new Map();w.entries.forEach(e=>{const k=lastKinds.get(e.topic);if(!k||Date.parse(e.at)>k.at)lastKinds.set(e.topic,{at:Date.parse(e.at),kinds:e.kinds})});
 const R=window.RESEARCH;
 function item(key){
  const id=key.slice(2);
  if(key[0]==='c'){const c=C.get(id);if(!c)return null;
   return {key,id,card:true,name:tr(c.name),state:tr(c.now),meta:c.date?tr(T.logged)+c.date.slice(5).replace('-','.'):'',focus:F.has(id)}}
  const t=TP.get(id);if(!t)return null;
  return {key,id,card:false,name:tr(t.name),meta:(t.last_at?hm(t.last_at):'')+(t.pending?(t.last_at?' · ':'')+T.editing(t.pending):''),hot:hot.has(id)};
 }
 const areas=AREAS.map(a=>{const r=R.areas.find(x=>x.id===a.id);
  const bands={};['field','tool','meas'].forEach(b=>bands[b]=(a[b]||[]).map(item).filter(Boolean));
  const papers=(a.papers||[]).map(id=>C.get(id)).filter(Boolean).map(c=>({key:'c:'+c.id,id:c.id,name:tr(c.name),state:tr(c.now),focus:F.has(c.id)}));
  return {id:a.id,w:a.w,c:r.c,name:L.T(r.ko,r.en),sub:tr(a.sub),bands,papers,dataset:!!a.dataset,
   hot:Object.keys(TOPIC_AREA).some(t=>TOPIC_AREA[t]===a.id&&hot.has(t))};
 });
 const color=id=>{const a=areas.find(a=>a.id===TOPIC_AREA[id]);return a?a.c:'#8b877d'};
 const topics=w.topics.slice().sort((a,b)=>(Date.parse(b.last_at)||0)-(Date.parse(a.last_at)||0)).map(t=>({id:t.id,name:tr(t.name),c:color(t.id),
  // entries hold the newest 80 changes only; an older topic keeps its time without the kinds
  time:t.last_at?hm(t.last_at):'',kinds:lastKinds.has(t.id)?lastKinds.get(t.id).kinds.map(k=>tr(KIND[k])).join(' · '):t.last_at?'':tr(T.noRecord),
  pending:t.pending,hot:hot.has(t.id)}));
 return {areas,topics,lastDay:latest?md(latest):''};
}

/* ---- desktop diagram (SVG in canvas pixels) ---- */
const NS='http://www.w3.org/2000/svg',VW=1168,X0=124,GAP=8,MAXH=516;
const FONT={name:[14,600],sub:[11,400],band:[13,500],bsub:[10.5,400],nm:[12.5,500],st:[11.5,600],meta:[10.5,400],mini:[11,400],pap:[12,400],badge:[11,700],leg:[10.5,400]};
const pen=document.createElement('canvas').getContext('2d');let family='sans-serif';
function wd(s,k){const f=FONT[k];pen.font=f[1]+' '+f[0]+'px '+family;return pen.measureText(s).width}
function fit(s,k,max){if(wd(s,k)<=max)return s;while(s&&wd(s+'…',k)>max)s=s.slice(0,-1);return s.trimEnd()+'…'}
/* two lines instead of an ellipsis: break at a space, or between characters for ja/zh (2026-11-08 "잘리면 안 돼") */
function wrap2(s,k,max){if(wd(s,k)<=max)return [s];const w=s.split(' ');let a='',i=0;
 for(;i<w.length;i++){const t=a?a+' '+w[i]:w[i];if(wd(t,k)>max&&a)break;a=t}
 let b=w.slice(i).join(' ');
 if(!b||wd(a,k)>max){let j=s.length;while(j>1&&wd(s.slice(0,j),k)>max)j--;a=s.slice(0,j);b=s.slice(j).trim()}
 return b?[a,fit(b,k,max)]:[a]}
// Spaces separate words; a word wider than the line (Japanese, Chinese) breaks per character.
function wrap(s,k,max,lim){
 const units=[];s.split(' ').forEach((w,i)=>{if(wd(w,k)>max)[...w].forEach((ch,j)=>units.push((i&&!j?' ':'')+ch));else units.push((i?' ':'')+w)});
 const out=[];let cur='';
 units.forEach(u=>{const t=cur+u;if(cur&&wd(t.trim(),k)>max){out.push(cur.trim());cur=u.trimStart()}else cur=t});
 if(cur.trim())out.push(cur.trim());
 if(out.length>lim){const rest=out.slice(lim-1).join(' ');out.length=lim-1;out.push(fit(rest,k,max))}
 return out}
function el(tag,a,p){const n=document.createElementNS(NS,tag);for(const k in a)if(a[k]!=null)n.setAttribute(k,a[k]);p.appendChild(n);return n}
function tx(s,k,a,p){const n=el('text',Object.assign({class:'lm-'+k},a),p);n.textContent=s;return n}

/* line sketch of each area's research object, drawn around (0,0) */
function rig(id,g,c){
 const s={stroke:c,'stroke-width':1.1,fill:'none','stroke-opacity':.8,'vector-effect':'non-scaling-stroke'};
 const P=d=>el('path',Object.assign({d},s),g),R=(x,y,w,h)=>el('rect',Object.assign({x,y,width:w,height:h},s),g);
 if(id==='A'){R(-72,-9,20,18);P('M-50 0h14');[0,1,2].forEach(k=>el('circle',Object.assign({cx:-24+k*20,cy:0,r:8},s),g));
  P('M20 0h14M34 0l12-12M34 0l12 12');R(46,-20,20,14);R(46,6,20,14)}
 else if(id==='B'){P('M-80 16l96-30M-74 23l96-30');[[-56,10],[-26,0],[4,-10]].forEach(d=>R(d[0],d[1]-8,13,10));
  R(36,-22,24,14);P('M60-18l9-4v12l-9-4M48-8v10');P('M40 6h16M44 12h10')}
 else if(id==='C'){P('M-82 10l26-22h30l-26 22zM-70 2h28M-62-6h28');P('M6 12l10-34 10 34M9-2h14M12-14h8');
  R(44,-14,20,26);P('M49-17h10M48-2l4-8 2 7 4-8')}
 else if(id==='D'){P('M-72 12v-26l15-9v9l15-9v9l15-9v35zM-18-12v-18h7v16');P('M6 2h8l5-14 7 26 6-18 5 6h12');P('M6 14h43')}
 else{R(-62,-18,30,36);P('M-56-10h18M-56-2h18M-56 6h10');P('M-32 0h14');R(-18,-16,40,26);P('M2 10v8M-8 18h20');P('M30 6h12l6-12')}
}

function drawMap(m){
 const svg=$('layerMap');svg.textContent='';
 family=getComputedStyle(document.body).fontFamily||'sans-serif';
 el('title',{id:'layerTitle'},svg).textContent=tr(T.title);
 const defs=el('defs',{},svg),gr=el('linearGradient',{id:'lmBand',x1:0,y1:0,x2:0,y2:1},defs);
 el('stop',{offset:0,'stop-color':'#ffffff','stop-opacity':.05},gr);el('stop',{offset:1,'stop-color':'#ffffff','stop-opacity':.012},gr);
 const bg=el('g',{},svg),fg=el('g',{},svg);
 let x=X0;m.areas.forEach(a=>{a.x=x;x+=a.w+GAP});

 /* legend on the left rail, beside the area headings */
 tx(tr(T.cols),'leg',{x:0,y:13},fg);tx(tr(T.rows),'leg',{x:0,y:28},fg);
 const lg=[[g=>el('circle',{cx:4,cy:-4,r:4,fill:'#c9c2b2'},g),T.has],[g=>el('circle',{cx:4,cy:-4,r:3,fill:'none',stroke:'#8d929b'},g),T.none],
  [g=>{el('circle',{cx:4,cy:-4,r:2.4,fill:'#b9a37a'},g);el('circle',{cx:4,cy:-4,r:5,fill:'none',stroke:'#b9a37a','stroke-width':1.2},g)},T.focus],
  [g=>el('rect',{x:1,y:-7,width:6,height:6,fill:'#b9a37a'},g),T.paper]];
 lg.forEach((d,i)=>{const g=el('g',{transform:'translate(0 '+(47+i*15)+')'},fg);d[0](g);tx(tr(d[1]),'leg',{x:14,y:0},g)});

 /* area headings and their research-object sketch */
 m.areas.forEach(a=>{
  el('circle',{cx:a.x+11,cy:12,r:10.5,fill:'none',stroke:a.c,'stroke-opacity':.75},fg);
  tx(a.id,'badge',{x:a.x+11,y:16,'text-anchor':'middle',fill:a.c},fg);
  // too wide for the column: narrow the glyphs a little rather than cut the name (2026-11-08)
  const squeeze=(s,k,max)=>wd(s,k)>max?{textLength:max,lengthAdjust:'spacingAndGlyphs'}:{};
  const nm=a.name,nw=Math.min(wd(nm,'name'),a.w-44);tx(nm,'name',Object.assign({x:a.x+28,y:17,fill:a.c},squeeze(nm,'name',a.w-44)),fg);
  tx(a.sub,'sub',Object.assign({x:a.x,y:37},squeeze(a.sub,'sub',a.w-4)),fg);
  if(a.hot)el('circle',{cx:a.x+28+nw+9,cy:12,r:3.6,fill:a.c,class:'blip'},fg);
  const pw=a.w-24,px=a.x+12,pcx=px+pw/2,pcy=68,ph=14;
  el('polygon',{points:[[px,pcy],[pcx,pcy-ph],[px+pw,pcy],[pcx,pcy+ph]].join(' '),fill:a.c,'fill-opacity':.05,stroke:a.c,'stroke-opacity':.5},bg);
  el('polygon',{points:[[px,pcy],[pcx,pcy+ph],[px+pw,pcy],[px+pw,pcy+5],[pcx,pcy+ph+5],[px,pcy+5]].join(' '),fill:a.c,'fill-opacity':.09},bg);
  rig(a.id,el('g',{transform:'translate('+pcx+' '+pcy+') scale(.56)'},fg),a.c);
  el('line',{x1:pcx,y1:pcy+ph+5,x2:pcx,y2:96,stroke:a.c,'stroke-opacity':.25,'stroke-dasharray':'2 5'},bg);
 });

 /* work layers: each row is as tall as its fullest column */
 let y=96;const rails=[];
 BANDS.forEach(B=>{
  const g=el('g',{transform:'translate(0 '+y+')'},fg);let h=46;const occ=[];
  m.areas.forEach(a=>{
   const ix=a.x+20,maxw=a.w-26;let yy=20;
   const items=B.id==='open'?a.papers:a.bands[B.id],has=items.length>0||(B.id==='open'&&a.dataset);
   if(has)occ.push(a);
   el('circle',{cx:a.x+6,cy:11,r:has?4.4:3,fill:has?a.c:'none',stroke:a.c,'stroke-opacity':has?0:.5},g);
   if(B.id==='open'){
    if(a.dataset){const n=DATASET.cells,step=Math.min(8.4,(maxw-6)/(n-1));
     for(let i=0;i<n;i++)el('circle',{cx:ix-6+i*step,cy:14,r:2.8,fill:'none',stroke:a.c,'stroke-opacity':.75},g);
     let dy=31;wrap(tr(DATASET.text),'mini',maxw+12,2).forEach(s=>{tx(s,'mini',{x:ix-10,y:dy},g);dy+=14});
     wrap(tr(DATASET.scope),'meta',maxw+12,2).forEach(s=>{tx(s,'meta',{x:ix-10,y:dy},g);dy+=14});yy=dy+3}
    items.forEach(p=>{
     const node=el('g',{'data-card':p.id},g);
     el('rect',{x:ix-12,y:yy-8,width:6,height:6,fill:a.c,'fill-opacity':p.focus?1:.55},node);
     const st='— '+p.state,sw=wd(st,'st'),one=wd(p.name,'pap')+6+sw<=maxw;
     const lines=one?[p.name]:wrap(p.name,'pap',maxw,2);lines.forEach((s,j)=>tx(s,'pap',{x:ix,y:yy+j*15},node));
     let by=yy+(lines.length-1)*15,bx=ix+wd(lines[lines.length-1],'pap')+6;if(bx+sw>ix+maxw){by+=15;bx=ix}
     tx(st,'st',{x:bx,y:by,fill:a.c,class:'lm-st st'},node);
     if(p.focus)el('rect',{x:ix-14.5,y:yy-10.5,width:11,height:11,fill:'none',stroke:a.c,'stroke-width':1.1,class:'pulse'},node);
     yy=by+(one?15:18)});
    h=Math.max(h,yy+2);return}
   items.forEach(it=>{
    const node=el('g',{'data-card':it.card?it.id:null,'data-topic':it.card?null:it.id},g);
    el('circle',{cx:ix-9,cy:yy-4,r:2.6,fill:a.c,'fill-opacity':it.card||it.hot?1:.5},node);
    if(it.focus)el('circle',{cx:ix-9,cy:yy-4,r:5.4,fill:'none',stroke:a.c,'stroke-width':1.3,class:'pulse'},node);
    if(it.card){
     const lines=wrap(it.name,'nm',maxw,3);lines.forEach((s,j)=>tx(s,'nm',{x:ix,y:yy+j*15},node));
     let by=yy+(lines.length-1)*15,bx=ix+wd(lines[lines.length-1],'nm')+8;
     const need=wd(it.state,'st')+(it.meta?8+wd(it.meta,'meta'):0);
     if(bx+need>ix+maxw){by+=15;bx=ix}
     tx(it.state,'st',{x:bx,y:by,fill:a.c,class:'lm-st st'},node);
     if(it.meta)tx(fit(it.meta,'meta',ix+maxw-bx-wd(it.state,'st')-8),'meta',{x:bx+wd(it.state,'st')+8,y:by},node);
     yy=by+21;
    }else{
     const mw=wd(it.meta,'meta'),one=wd(it.name,'nm')+12+mw<=maxw,nl=one?[it.name]:wrap(it.name,'nm',maxw,3);
     nl.forEach((line,j)=>tx(line,'nm',{x:ix,y:yy+15*j,class:'lm-nm'+(it.hot?'':' cold')},node));
     tx(it.meta,'meta',{x:one?ix+maxw:ix,y:one?yy:yy+14+15*(nl.length-1),'text-anchor':one?'end':null,fill:it.hot?a.c:null,class:'lm-meta meta'},node);
     yy+=one?19:33+15*(nl.length-1);
    }
   });
   h=Math.max(h,yy-6);
  });
  el('rect',{x:X0,y,width:VW-X0,height:h,fill:'url(#lmBand)'},bg);
  el('line',{x1:X0,y1:y,x2:VW,y2:y,stroke:'#efe6d0','stroke-opacity':.14},bg);
  tx(tr(B.name),'band',{x:0,y:y+20},fg);
  wrap(tr(B.sub),'bsub',X0-14,2).forEach((s,j)=>tx(s,'bsub',{x:0,y:y+36+j*13},fg));
  if(occ.length>1)rails.push([occ[0].x+6,occ[occ.length-1].x+6,y+11]);
  y+=h+4;
 });
 rails.forEach(r=>el('line',{x1:r[0],y1:r[2],x2:r[1],y2:r[2],stroke:'#b9a37a','stroke-opacity':.3,'stroke-dasharray':'1 6'},bg));
 m.areas.forEach(a=>el('line',{x1:a.x+6,y1:96,x2:a.x+6,y2:y-4,stroke:a.c,'stroke-opacity':.22,'stroke-width':2},bg));

 /* recorded changes per topic, newest first; a file count is not a measure of progress */
 const S=y+6,strip=el('g',{class:'strip'},fg);
 el('line',{x1:0,y1:S,x2:VW,y2:S,stroke:'#efe6d0','stroke-opacity':.16},bg);
 tx(tr(T.changes),'band',{x:0,y:S+19},strip);
 if(m.lastDay){el('circle',{cx:4,cy:S+31,r:3.4,fill:'#b9a37a',class:'blip'},strip);tx(tr(T.latest)+m.lastDay,'meta',{x:13,y:S+35},strip)}
 const n=Math.max(1,m.topics.length),cw=(VW-X0-6*(n-1))/n;
 const names=m.topics.map(t=>wrap2(t.name,'nm',cw-12)),kinds=m.topics.map(t=>wrap2(t.kinds,'meta',cw-12));
 const dy=14*(Math.max(1,...names.map(x=>x.length))-1),dk=13*(Math.max(1,...kinds.map(x=>x.length))-1);
 let bottom=S+50+dy+dk;
 m.topics.forEach((t,i)=>{
  const cx=X0+i*(cw+6),node=el('g',{'data-topic':t.id},strip);
  el('rect',{x:cx,y:S+7,width:2.5,height:(t.pending?58:44)+dy+dk,fill:t.c,'fill-opacity':t.hot?.9:.35},node);
  names[i].forEach((line,j)=>tx(line,'nm',{x:cx+9,y:S+19+14*j,class:'lm-nm'+(t.hot?'':' cold')},node));
  tx(t.time||'—','meta',{x:cx+9,y:S+34+dy,fill:t.hot?t.c:null},node);
  kinds[i].forEach((line,j)=>tx(line,'meta',{x:cx+9,y:S+48+dy+13*j},node));
  if(t.pending){tx(T.editing(t.pending),'meta',{x:cx+9,y:S+62+dy+dk,class:'lm-meta pend'},node);bottom=S+66+dy+dk}
 });
 const H=Math.ceil(bottom);
 svg.setAttribute('viewBox','0 0 '+VW+' '+H);svg.setAttribute('width',VW);svg.setAttribute('height',Math.min(H,MAXH));
}

/* ---- phone list: the same model as stacked text ---- */
function drawList(m){
 const box=$('layerList');box.innerHTML='';
 m.areas.forEach(a=>{
  const sec=make('section','ll-area');sec.style.setProperty('--c',a.c);
  const h=make('h3');h.append(make('i','',a.id),make('span','',a.name),make('small','',a.sub));sec.append(h);
  BANDS.forEach(B=>{
   const rows=B.id==='open'?a.papers:a.bands[B.id];if(!rows.length&&!(B.id==='open'&&a.dataset))return;
   const band=make('div','ll-band'),ul=make('ul');band.append(make('span','',tr(B.name)),ul);
   if(B.id==='open'&&a.dataset){const li=make('li');li.append(make('span','',tr(DATASET.text)),make('small','',tr(DATASET.scope)));ul.append(li)}
   rows.forEach(it=>{const li=make('li');li.append(make('span','',it.name));
    if(it.state)li.append(make('em','',it.state));
    if(it.meta)li.append(make('small','',it.meta));ul.append(li)});
   sec.append(band);
  });
  box.append(sec);
 });
 const sec=make('section','ll-area ll-strip'),h=make('h3');h.append(make('span','',tr(T.changes)),make('small','',m.lastDay?tr(T.latest)+m.lastDay:''));sec.append(h);
 const ul=make('ul');m.topics.forEach(t=>{const li=make('li');li.style.setProperty('--c',t.c);li.append(make('span','',t.name),make('small','',[t.time,t.kinds,t.pending?T.editing(t.pending):''].filter(Boolean).join(' · ')));ul.append(li)});
 sec.append(ul);box.append(sec);
}

function render(){
 if(!board)return;const m=model();drawMap(m);drawList(m);$('boardEmpty').hidden=true;tick();
}
function tick(){
 const source=board?{schema_version:2,generated_at:board.generated_at}:P;
 const state=(board?boardFailed:reloadFailed)?'error':L.freshness(source);$('freshDot').dataset.state=state;
 // A current record needs no label; only a late or failed one is shown.
 const labels={delayed:['갱신 지연','Update delayed','更新遅延','更新延迟'],stale:['오래된 기록','Old record','古い記録','旧记录'],unknown:['기록 확인 불가','Record unavailable','記録確認不可','无法获取记录'],error:['재독 실패 · 이전 기록','Reload failed · previous record','再取得失敗・前回記録','重新获取失败 · 保留先前记录']};
 $('freshLabel').textContent=labels[state]?tr(labels[state]):'';$('freshDot').parentElement.hidden=state==='current';
 const b=$('boardFresh');b.textContent=board?(boardFailed?tr(['재독 실패 · 이전 기록 유지','Refresh failed · previous record retained','再取得失敗・前回記録を保持','重新获取失败 · 保留先前记录']):tr(['데이터 기준 ','Data as of ','データ基準 ','数据截至 '])+stamp(board.work.collected_at)+' KST · '+L.ago(board.work.collected_at)):tr(['작업 기록 확인 중','Loading work records','作業記録を確認中','正在读取工作记录']);
 b.title=board?board.work.collected_at:'';
}
async function refreshPulse(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch('pulse.js?ts='+Date.now(),{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error();const text=await response.text(),m=text.match(/^\s*window\.PULSE\s*=\s*([\s\S]*);\s*$/),p=m?JSON.parse(m[1]):null;
  if(!validPulse(p)||L.freshness(p)==='unknown'||(P&&Date.parse(p.generated_at)<Date.parse(P.generated_at)))throw Error();P=p;window.PULSE=p;reloadFailed=false;
 }catch(_){reloadFailed=true}finally{clearTimeout(timer);tick()}
}
async function refreshBoard(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const r=await fetch('activity.json?ts='+Date.now(),{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const b=await r.json();if(!validBoard(b)||(board&&Date.parse(b.generated_at)<Date.parse(board.generated_at)))throw Error();
  board=b;boardFailed=false;render();
 }catch(_){boardFailed=true;if(!board)$('boardEmpty').textContent=tr(['진행 데이터를 불러오지 못했습니다. 실적·연구과제 페이지에서 기록을 확인할 수 있습니다.','Progress is unavailable. The record and applications pages remain available.','進行情報を取得できません。実績・研究課題ページをご覧ください。','暂时无法读取进展。可查看业绩和科研项目页面。']);tick()}finally{clearTimeout(timer)}
}
async function refresh(){if(loading)return;loading=true;try{await Promise.all([refreshPulse(),refreshBoard()])}finally{loading=false}}
// Legacy project steps remain as a screen-reader fallback and consistency oracle.
function fallback(){const box=$('rows');box.innerHTML='';window.PROGRESS.projects.forEach(p=>{const r=make('div','pr');r.append(make('span','',tr(p.name)));p.steps.forEach(s=>r.append(make('span','',tr(window.PROGRESS.steps[s[0]]))));box.append(r)})}
L.onLang.push(()=>{fallback();render();tick()});
// Text widths are measured with the loaded web font; draw again once it arrives.
if(document.fonts){document.fonts.ready.then(render);document.fonts.addEventListener('loadingdone',render)}
// One network read on page load; the daily publication does not cause polling.
// This timer updates relative time on screen only and sends no requests.
setInterval(tick,15000);
fallback();tick();refreshBoard();
window.DEVELOPMENT={refresh,refreshBoard,validBoard,AREAS,get snapshot(){return board}};
})();
