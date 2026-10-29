/* Five static area URLs share one content source and renderer. */
(function(){
  const L=window.LAB,R=window.RESEARCH,area=R.areas.find(t=>t.id===document.body.dataset.area);
  const order=['A','B','C','D','E'];
  if(!area)throw new Error('Unknown research area');
  const tr=pair=>L.T(pair[0],pair[1]);
  const local=path=>{const u=new URL(path,location.href);u.searchParams.set('lang',L.lang());return u.href};
  const set=(id,text)=>document.getElementById(id).textContent=text;
  function render(){
    const active=document.activeElement&&document.activeElement.dataset.focus;
    // the label doubles as the way back to the research map
    const up=document.createElement('a');up.className='up';up.href=local('map.html?area='+area.id);up.textContent=L.T('← 연구 분야','← Research');
    document.getElementById('area-kicker').replaceChildren(up,' · '+L.T('연구 분야 ','AREA ')+area.id);
    set('area-title',L.T(area.ko,area.en));
    set('area-question',L.T(area.q[0].join(' '),area.q[1].join(' ')));
    set('area-summary',L.T(area.wko,area.wen));
    set('area-limit',tr(area.limit));
    document.title=L.T(area.ko,area.en)+' — AI for Energy & Manufacturing Lab';
    const nav=document.getElementById('area-nav');nav.replaceChildren();
    nav.setAttribute('aria-label',L.T('연구 분야 선택','Choose a research area'));
    order.map(id=>R.areas.find(t=>t.id===id)).forEach(t=>{
      const a=document.createElement('a');a.href=local(t.href);a.textContent=t.id;
      a.title=L.T(t.ko,t.en);a.setAttribute('aria-label',a.title);a.dataset.focus='nav-'+t.id;
      if(t.id===area.id)a.setAttribute('aria-current','page');
      nav.appendChild(a);
    });
    const steps=document.getElementById('area-steps');steps.replaceChildren();
    const labels=[['입력','Input'],['방법','Method'],['확인할 결과','What to check']];
    area.steps.forEach((pair,i)=>{
      const li=document.createElement('li'),small=document.createElement('small'),strong=document.createElement('strong');
      small.textContent=String(i+1).padStart(2,'0')+' · '+tr(labels[i]);strong.textContent=tr(pair);
      li.append(small,strong);steps.appendChild(li);
    });
    const products=document.getElementById('area-products');products.replaceChildren();
    area.leaves.forEach((leaf,i)=>{
      const row=document.createElement('div');row.className='area-output';
      const name=document.createElement(area.links[i]?'a':'span');name.textContent=L.T(leaf[0],leaf[1]);
      if(area.links[i]){name.href=local(area.links[i]);name.dataset.focus='output-'+i}
      const badge=document.createElement('span'),status=R.statuses[leaf[2]];
      badge.className='pill';badge.textContent=L.T(status[0],status[1]);badge.style.color=status[2];
      row.append(name,badge);products.appendChild(row);
    });
    const action=document.getElementById('area-action');action.href=local(area.action[0]);action.textContent=L.T(area.action[1],area.action[2]);
    document.getElementById('area-back').href=local('map.html?area='+area.id);
    // Canonical ID order is independent of the map's B-D-C adjacency.
    const next=R.areas.find(t=>t.id===order[(order.indexOf(area.id)+1)%order.length]);
    const n=document.getElementById('area-next');n.href=local(next.href);n.textContent=L.T('다음 분야: ','Next area: ')+L.T(next.ko,next.en)+' →';
    if(active){const node=document.querySelector('[data-focus="'+active+'"]');if(node)node.focus()}
  }
  L.onLang.push(render);
})();
