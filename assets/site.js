/* Shared chrome for every lab page: top bar, language, full-window fit, Esc to home.
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
    // phones fold the menu behind this button (site.css); desktops always show the menu
    +'<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu"><span></span><i aria-hidden="true">☰</i></button>'
    +'<nav class="menu" id="site-menu">'+PAGES.map(p=>'<a href="'+p[1]+'" class="'+(p[0]===here?'on':'')+(p[4]?' soon':'')+'" data-ko="'+p[2]+'" data-en="'+p[3]+'"></a>').join('')+'</nav>'
    // language picker: the current language only, the four choices open on click
    +'<div class="lang"><button class="lang-cur" type="button" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c1.8 1.9 2.6 3.9 2.6 6.2S9.8 12.3 8 14.2M8 1.8C6.2 3.7 5.4 5.7 5.4 8s.8 4.3 2.6 6.2"/></svg><span></span><i aria-hidden="true">▾</i></button>'
    +'<div class="lang-menu" role="menu" hidden>'+LANGS.map(l=>'<button type="button" role="menuitemradio" data-l="'+l[0]+'" lang="'+HTML_LANG[l[0]]+'">'+l[2]+'</button>').join('')+'</div></div>';
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
    // links between pages carry the chosen language, so a copied address opens in it
    document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!/^[\w-]+\.html(\?[^#]*)?(#.*)?$/.test(h))return;
      const u=new URL(h,location.href);u.searchParams.set('lang',lang);a.setAttribute('href',h.split(/[?#]/)[0]+u.search+u.hash)});
    top.querySelector('.menu-btn span').textContent=T('메뉴','Menu','メニュー','菜单');
    document.querySelectorAll('.lang-menu button').forEach(b=>{const on=b.dataset.l===lang;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
    const cur=document.querySelector('.lang-cur');cur.querySelector('span').textContent=LANGS.find(l=>l[0]===lang)[2];
    cur.setAttribute('aria-label',T('언어 선택','Choose language','言語を選択','选择语言')+': '+LANGS.find(l=>l[0]===lang)[2]);
    note();
    window.LAB.onLang.forEach(f=>f());
  }
  window.LAB.apply=apply;
  const langMenu=top.querySelector('.lang-menu'),langCur=top.querySelector('.lang-cur');
  function openLang(on){langMenu.hidden=!on;langCur.setAttribute('aria-expanded',on);if(on)(langMenu.querySelector('.on')||langMenu.firstChild).focus()}
  const menuBtn=top.querySelector('.menu-btn');
  function openMenu(on){top.classList.toggle('open',on);menuBtn.setAttribute('aria-expanded',on)}
  document.addEventListener('click',e=>{
    if(e.target.closest('.menu-btn')){openMenu(!top.classList.contains('open'));return}
    if(top.classList.contains('open')&&!e.target.closest('.menu'))openMenu(false);
    if(e.target.closest('.lang-cur')){openLang(langMenu.hidden);return}
    const b=e.target.closest('.lang-menu button');
    if(!b){if(!langMenu.hidden)openLang(false);return}
    lang=b.dataset.l;openLang(false);langCur.focus();
    try{localStorage.setItem('lab-lang',lang)}catch(_){}
    try{const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u)}catch(_){}
    apply()});
  langMenu.addEventListener('keydown',e=>{
    const step={ArrowDown:1,ArrowUp:-1}[e.key];if(!step)return;e.preventDefault();
    const items=[...langMenu.children],i=items.indexOf(document.activeElement);items[(i+step+items.length)%items.length].focus()});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!langMenu.hidden){openLang(false);langCur.focus();return}  // Esc closes the picker before it leaves the page
    if(e.key==='Escape'&&top.classList.contains('open')){openMenu(false);menuBtn.focus();return}
    if(e.key==='Escape'&&here!=='home'&&!e.target.matches('input')){
    const back=document.body.dataset.back;
    if(back){const u=new URL(back,location.href);u.searchParams.set('lang',lang);location.href=u.href}
    else location.href='index.html?lang='+lang;
  }});
  window.LAB.onLang.push(()=>document.querySelectorAll('.area-entry').forEach(a=>{
    const R=window.RESEARCH,t=R&&R.areas.find(t=>t.id===a.dataset.area);
    if(!t)throw new Error('Home research catalog is unavailable');
    const u=new URL(t.href,location.href);u.searchParams.set('lang',lang);a.href=u.href;
    a.querySelector('span').textContent=T(t.ko,t.en);
    const color=id=>R.areas.find(t=>t.id===id).c;
    a.querySelector('i').style.background=t.id==='D'?'linear-gradient(90deg,'+color('C')+','+color('B')+')':t.c;
  }));
  // Phones use the stacked layout in site.css instead of a shrunken canvas.
  const phone=window.matchMedia('(max-width:900px),(max-height:500px)');
  function fit(){const s=document.getElementById('stage'),p=document.getElementById('page');
    if(phone.matches){p.style.transform=p.style.width=p.style.height='';p.style.removeProperty('--ox');p.style.removeProperty('--oy');return}
    // The 1280x720 layout keeps its size; the canvas widens (or deepens) to the window's
    // ratio so the top bar, footer and background reach every edge with no side bands.
    const k=Math.min(s.clientWidth/1280,s.clientHeight/720),W=Math.max(1280,s.clientWidth/k),H=Math.max(720,s.clientHeight/k);
    p.style.width=W+'px';p.style.height=H+'px';
    p.style.setProperty('--ox',(W-1280)/2+'px');p.style.setProperty('--oy',(H-720)/2+'px');
    p.style.transform='scale('+k+')'}
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
