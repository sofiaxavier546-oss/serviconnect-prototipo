(() => {
 const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
 const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
 let maxCategories=4, step=1;
 const savedBrand=localStorage.getItem('serviconnect_brand')||'ServiConnect';
 $$('[data-brand]').forEach(el=>el.textContent=savedBrand);

 function renderCategories(){
  $('#categoryGrid').innerHTML=ServiData.categories.slice(0,maxCategories).map(c=>`<button class="category-card" type="button" data-category="${c.name}"><span class="category-icon">${c.icon}</span><h3>${c.name}</h3><p>${c.count}</p></button>`).join('');
  $$('.category-card').forEach(b=>b.addEventListener('click',()=>openService(b.dataset.category)));
 }
 function renderProfessionals(list=ServiData.professionals){
  $('#professionalGrid').innerHTML=list.map(p=>`<article class="pro-card"><div class="pro-top"><div class="pro-avatar">${p.initials}</div><div><h3>${p.name}</h3><span class="muted">${p.specialty}</span><br>${p.verified?'<span class="badge">✓ Verificado</span>':''}</div><button class="heart" data-favorite="${p.id}" aria-label="Favoritar" type="button">♡</button></div><div class="metrics"><div><span>Avaliação</span><strong>⭐ ${p.rating}</strong></div><div><span>Distância</span><strong>${p.distance} km</strong></div><div><span>Chegada</span><strong>${p.eta} min</strong></div></div><div class="price-row"><div><span class="muted">A partir de</span><br><strong>${money(p.price)}</strong></div>${p.fair?'<span class="fair">✓ PREÇO JUSTO</span>':''}</div></article>`).join('');
  $$('.heart').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');b.textContent=b.classList.contains('active')?'♥':'♡';toast(b.classList.contains('active')?'Profissional adicionado aos favoritos.':'Profissional removido dos favoritos.')}));
 }
 function fillServices(){ $('#serviceType').innerHTML='<option value="">Selecione</option>'+ServiData.categories.map(c=>`<option value="${c.name}">${c.name} - ${c.service}</option>`).join(''); }
 function openService(category=''){ $('#serviceModal').hidden=false;document.body.style.overflow='hidden'; if(category) $('#serviceType').value=category; showStep(1); }
 function closeService(){ $('#serviceModal').hidden=true;document.body.style.overflow=''; }
 function showStep(n){ step=n; $$('.form-step').forEach(s=>s.classList.toggle('active',+s.dataset.step===n)); $$('[data-step-dot]').forEach(d=>d.classList.toggle('active',+d.dataset.stepDot<=n)); $('#backBtn').hidden=n===1;$('#nextBtn').hidden=n===3;$('#finishBtn').hidden=n!==3;if(n===3) updateEstimate(); }
 function currentValid(){ const sec=$(`.form-step[data-step="${step}"]`);return [...sec.querySelectorAll('[required]')].every(i=>{if(!i.value.trim()){i.reportValidity();return false}return true}); }
 function updateEstimate(){ const category=ServiData.categories.find(c=>c.name===$('#serviceType').value);const base=category?.base||100;complex=+$('#complexity').value;urg=+$('#urgency').value;special=$('#specialTime').checked?40:0;const ref=base*complex+20+urg+special;$('#referencePrice').textContent=money(ref);$('#priceRange').textContent=`${money(ref*.8)} a ${money(ref*1.2)}`;$('#requestSummary').innerHTML=`<b>${category?.service||'Serviço'}</b><br>${$('#address').value}, ${$('#number').value}<br>Complexidade ${complex}x • deslocamento simulado de ${money(20)}`; }
 function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}

 renderCategories();renderProfessionals();fillServices();
 $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openService()));
 $$('[data-close]').forEach(b=>b.addEventListener('click',closeService));
 $('#showAllCategories').addEventListener('click',e=>{maxCategories=maxCategories===4?8:4;renderCategories();e.target.textContent=maxCategories===4?'Ver todas':'Mostrar menos'});
 $('#sortSelect').addEventListener('change',e=>{const l=[...ServiData.professionals],v=e.target.value;if(v==='price')l.sort((a,b)=>a.price-b.price);if(v==='distance')l.sort((a,b)=>a.distance-b.distance);if(v==='rating')l.sort((a,b)=>b.rating-a.rating);if(v==='score')l.sort((a,b)=>(b.rating-b.distance/20)-(a.rating-a.distance/20));renderProfessionals(l)});
 $('#renameBtn').addEventListener('click',()=>{const n=prompt('Digite o nome do protótipo:',localStorage.getItem('serviconnect_brand')||'ServiConnect');if(n&&n.trim()){localStorage.setItem('serviconnect_brand',n.trim().slice(0,30));$$('[data-brand]').forEach(el=>el.textContent=n.trim().slice(0,30));toast('Nome atualizado no navegador.')}});
 $('#nextBtn').addEventListener('click',()=>{if(currentValid())showStep(step+1)});$('#backBtn').addEventListener('click',()=>showStep(step-1));
 $('#serviceForm').addEventListener('submit',e=>{e.preventDefault();const count=+(localStorage.getItem('serviconnect_requests')||3)+1;localStorage.setItem('serviconnect_requests',count);$('#requestedCount').textContent=count;closeService();e.target.reset();toast('Solicitação simulada. Profissionais encontrados!')});
 $('#requestedCount').textContent=localStorage.getItem('serviconnect_requests')||3;
 $('#cep').addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v});
 $('#chatBtn').addEventListener('click',()=>toast('Chat demonstrativo: João está a caminho.'));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#serviceModal').hidden)closeService()});
 if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();