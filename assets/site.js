/* Shared chrome for every lab page: top bar, language, 1280x720 fit, Esc to home.
   Korean is the source text. English sits next to it in data-en or the second
   argument of LAB.T. Japanese and Chinese (Simplified) come from assets/i18n.js,
   keyed by the Korean text; a missing entry falls back to English and is
   recorded in LAB.miss so tools/check_pages.py can fail on it. */
(function(){
  const PAGES=[
    ['home','index.html','홈','Home'],
    ['map','map.html','연구 분야','Research'],
    ['maia','maia.html','MAIA 진단','MAIA check'],
    ['record','record.html','실적','Track record'],
    ['open','open.html','개발 현황','Development'],
    ['data','data.html','공개 자료','Data & code'],
    ['work','work.html','함께하기','Work with us'],
    ['about','about.html','소개','About']
  ];
  const LANGS=[['ko','KO','한국어'],['en','EN','English'],['ja','JA','日本語'],['zh','ZH','简体中文']];
  const HTML_LANG={ko:'ko',en:'en',ja:'ja',zh:'zh-Hans'};
  const FONT={ja:'Noto+Sans+JP',zh:'Noto+Sans+SC'};
  const NOTE={};
  const ok=l=>LANGS.some(x=>x[0]===l);
  function norm(tag){
    tag=String(tag||'').toLowerCase();
    if(tag.startsWith('ko'))return 'ko';
    if(tag.startsWith('ja'))return 'ja';
    // Simplified only; Traditional-Chinese browsers (zh-TW, zh-HK, zh-Hant) get English by design
    if(tag==='zh'||tag.startsWith('zh-cn')||tag.startsWith('zh-sg')||tag.startsWith('zh-hans'))return 'zh';
    if(tag.startsWith('en'))return 'en';
    return '';
  }
  const here=document.body.dataset.page||'home';
  let lang=(()=>{
    const q=norm(new URLSearchParams(location.search).get('lang'));
    if(q){try{localStorage.setItem('lab-lang',q)}catch(e){}return q}
    try{const s=localStorage.getItem('lab-lang');if(ok(s))return s}catch(e){}
    for(const t of (navigator.languages||[navigator.language])){const l=norm(t);if(l)return l}
    return 'en';
  })();
  const miss=new Map();
  function look(ko,en){
    const d=(window.LAB_I18N||{})[lang]||{};
    if(Object.prototype.hasOwnProperty.call(d,ko))return d[ko];
    miss.set(ko,en);return en;
  }
  function T(ko,en,ja,zh){
    if(lang==='ko')return ko;
    if(lang==='en')return en;
    const v=lang==='ja'?ja:zh;
    return v!==undefined?v:look(ko,en);
  }
  window.LAB={lang:()=>lang,T,onLang:[],miss};

  const top=document.createElement('div');top.className='top';
  top.innerHTML='<a class="brand" href="index.html"><svg viewBox="0 0 24 24" fill="none" stroke="#b9a37a" stroke-width="1.4"><path d="M3 8 12 3l9 5-9 5z"/><path d="M3 12.5 12 17.5l9-5"/><path d="M3 17l9 5 9-5"/></svg><span data-ko="AI for Energy &amp; Manufacturing Lab" data-en="AI for Energy &amp; Manufacturing Lab" data-ja="AI for Energy &amp; Manufacturing Lab" data-zh="AI for Energy &amp; Manufacturing Lab"></span></a>'
    +'<nav class="menu">'+PAGES.map(p=>'<a href="'+p[1]+'" class="'+(p[0]===here?'on':'')+(p[4]?' soon':'')+'" data-ko="'+p[2]+'" data-en="'+p[3]+'"></a>').join('')+'</nav>'
    +'<div class="lang">'+LANGS.map(l=>'<button data-l="'+l[0]+'" title="'+l[2]+'" aria-label="'+l[2]+'">'+l[1]+'</button>').join('')+'</div>';
  document.getElementById('page').prepend(top);

  function font(){
    if(!FONT[lang]||document.getElementById('font-'+lang))return;
    const k=document.createElement('link');k.id='font-'+lang;k.rel='stylesheet';
    k.href='https://fonts.googleapis.com/css2?family='+FONT[lang]+':wght@400;500;600;700&display=swap';
    document.head.appendChild(k);
  }
  function note(){
    const f=document.querySelector('.foot');
    let n=document.querySelector('.mt');
    if(!NOTE[lang]){if(n)n.remove();return}
    if(!n){n=document.createElement('span');n.className='mt';
      if(f)f.insertBefore(n,f.querySelector('.r'));else{n.classList.add('float');document.getElementById('page').appendChild(n)}}
    n.textContent=NOTE[lang];
  }
  function apply(){
    document.documentElement.lang=HTML_LANG[lang];
    font();
    document.querySelectorAll('[data-ko]').forEach(e=>{
      const s=e.dataset;let v=lang==='ko'?s.ko:lang==='en'?s.en:(s[lang]!==undefined?s[lang]:look(s.ko,s.en));
      if(v==null)v=s.ko;
      if(e instanceof SVGElement)e.textContent=v;else e.innerHTML=v;
    });
    document.querySelectorAll('.lang button').forEach(b=>{const on=b.dataset.l===lang;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    note();
    window.LAB.onLang.forEach(f=>f());
  }
  window.LAB.apply=apply;
  document.addEventListener('click',e=>{const b=e.target.closest('.lang button');if(!b)return;lang=b.dataset.l;
    try{localStorage.setItem('lab-lang',lang)}catch(_){}
    try{const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u)}catch(_){}
    apply()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&here!=='home'&&!e.target.matches('input')){
    const back=document.body.dataset.back;
    if(back){const u=new URL(back,location.href);u.searchParams.set('lang',lang);location.href=u.href}
    else location.href='index.html';
  }});
  window.LAB.onLang.push(()=>document.querySelectorAll('.area-entry').forEach(a=>{
    const R=window.RESEARCH,t=R&&R.areas.find(t=>t.id===a.dataset.area);
    if(!t)throw new Error('Home research catalog is unavailable');
    const u=new URL(t.href,location.href);u.searchParams.set('lang',lang);a.href=u.href;
    a.querySelector('span').textContent=T(t.ko,t.en);
    const color=id=>R.areas.find(t=>t.id===id).c;
    a.querySelector('i').style.background=t.id==='D'?'linear-gradient(90deg,'+color('C')+','+color('B')+')':t.c;
  }));
  function fit(){const s=document.getElementById('stage');const k=Math.min(s.clientWidth/1280,s.clientHeight/720);document.getElementById('page').style.transform='scale('+k+')'}
  window.addEventListener('resize',fit);fit();
  const AGO={ko:['초 전','분 전','시간 전','일 전'],en:['s ago','m ago','h ago','d ago'],ja:['秒前','分前','時間前','日前'],zh:['秒前','分钟前','小时前','天前']};
  window.LAB.ago=function(iso){const t=new Date(iso).getTime();if(!isFinite(t))return '—';
    const s=Math.max(0,(Date.now()-t)/1000),u=AGO[lang],f=Math.floor;
    if(s<60)return f(s)+u[0];if(s<3600)return f(s/60)+u[1];if(s<86400)return f(s/3600)+u[2];return f(s/86400)+u[3]};
  window.LAB.freshness=function(p,now=Date.now()){
    const t=Date.parse(p&&p.generated_at),age=now-t;
    if(!p||p.schema_version!==2||!Number.isFinite(t)||age<0)return 'unknown';
    return age<=26*3600000?'current':age<=50*3600000?'delayed':'stale';
  };
  const CJK={ko:['억','만'],ja:['億','万'],zh:['亿','万']};
  const LOC={ko:'ko-KR',en:'en-US',ja:'ja-JP',zh:'zh-CN'};
  window.LAB.num=n=>Math.round(n).toLocaleString(LOC[lang]);
  window.LAB.big=function(n){const c=CJK[lang],num=window.LAB.num;
    if(c){if(n>=99995000)return (n/1e8).toFixed(1)+c[0];if(n>=1e5)return num(n/1e4)+c[1];if(n>=1e4)return (n/1e4).toFixed(1)+c[1];return num(n)}
    if(n>=1e9)return (n/1e9).toFixed(2)+'B';if(n>=1e6)return (n/1e6).toFixed(1)+'M';if(n>=1e3)return (n/1e3).toFixed(1)+'K';return num(n)};
  window.LAB.count=function(node,to,ms,fmt){const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/ms);const e=1-Math.pow(1-k,3);node.textContent=fmt(to*e);if(k<1)requestAnimationFrame(f)})(t0)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
