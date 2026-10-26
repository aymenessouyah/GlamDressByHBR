'use strict';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

/* Le catalogue vit dans catalog.js (chargé avant ce fichier). */
const products=(window.CATALOG||[]).slice();
const SIZES=window.SIZES||['À préciser','XS','S','M','L','XL','Autre / besoin de conseils'];

/* Ouverture / fermeture des dialogues, y compris sur les navigateurs
   anciens qui ne connaissent pas encore l'API <dialog>. */
function showDialog(d){if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','')}
function closeDialog(d){if(typeof d.close==='function')d.close();else d.removeAttribute('open')}

let selected=[];try{const saved=JSON.parse(localStorage.getItem('glamdress-selection-v1')||'[]');if(Array.isArray(saved))selected=saved.filter(x=>products.some(p=>p.id===x.id)&&typeof x.size==='string').slice(0,4)}catch{}
let filter='Tous';
const adv={color:'',size:'',mode:'',budget:''};

/* ── Sélection partagée ────────────────────────────────────────
   Format du lien : ?sel=I01.2,I03.0  (référence.taille)
   Aucune donnée personnelle n'y figure : uniquement des
   références d'inspirations et un code de taille. */
function sizeIndex(size){const i=SIZES.indexOf(size);return i<0?0:i}
function shareUrl(){
  const base=location.origin+location.pathname;
  if(!selected.length)return base+'#collection';
  const sel=selected.map(x=>x.id+'.'+sizeIndex(x.size)).join(',');
  return base+'?sel='+sel+'#collection';
}
function readSharedSelection(){
  const raw=new URLSearchParams(location.search).get('sel');
  if(!raw)return 0;
  let added=0;
  raw.split(',').slice(0,4).forEach(pair=>{
    const [id,code]=pair.split('.');
    const product=products.find(p=>p.id===id);
    if(!product)return;
    if(selected.some(x=>x.id===id))return;
    if(selected.length>=4)return;
    selected.push({id,size:SIZES[Number(code)]||'À préciser'});
    added++;
  });
  if(added)persist();
  try{history.replaceState(null,'',location.pathname+(location.hash||'#collection'))}catch{}
  return added;
}

/* Couverture d'une robe : `photo` (une image) ou `photos` (galerie, la
   première sert de couverture). Sans photo : illustration générée. */
function cover(p){
  if(p.photo)return p.photo;
  if(Array.isArray(p.photos)&&p.photos.length)return p.photos[0];
  return null;
}
function shots(p){
  const list=[];
  if(p.photo)list.push(p.photo);
  if(Array.isArray(p.photos))p.photos.forEach(x=>{if(typeof x==='string'&&!list.includes(x))list.push(x)});
  return list;
}
function art(p){
  const src=cover(p);
  if(src)return `<img src="${src}" alt="${p.alt?p.alt:'Robe '+p.name}" loading="lazy" width="600" height="800">`;
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="g${p.id}"><stop stop-color="${p.color}"/><stop offset=".45" stop-color="${p.color}"/><stop offset=".64" stop-color="#ffffff" stop-opacity=".65"/><stop offset="1" stop-color="${p.color}"/></linearGradient></defs><rect width="300" height="400" fill="${p.bg}"/><path d="M35 400V140a115 115 0 0 1 230 0v260" fill="none" stroke="#ffffff" stroke-opacity=".55"/><ellipse cx="150" cy="358" rx="99" ry="12" fill="#554838" opacity=".12"/><path d="M143 57q7-9 14 0l-2 31h-10z" fill="#b4a897"/><path d="M120 83q30 18 60 0l-8 66q22 83 65 199-87 23-174 0 47-117 65-199z" fill="url(#g${p.id})" stroke="#554b3b" stroke-opacity=".2"/><path d="M128 147q22 11 44 0M145 158q-8 120-39 193M157 158q0 113 37 193M150 164v192" fill="none" stroke="#63533f" stroke-opacity=".2"/>${p.cat==='Orientale'?'<path d="m120 85-35 24-21 113 27 9 29-105m60-41 35 24 21 113-27 9-29-105" fill="'+p.color+'"/><path d="M150 96v257" stroke="#f8e3a7" stroke-width="5"/><path d="M130 143h40" stroke="#f8e3a7" stroke-width="5"/>':''}<text x="150" y="386" text-anchor="middle" font-family="Arial" font-size="7" letter-spacing="2" fill="#655d50">ILLUSTRATION D’INSPIRATION</text></svg>`;
}
function priceLabel(p){return p.priceFrom?`À partir de ${p.priceFrom} DT`:'Tarifs sur demande'}

function persist(){try{localStorage.setItem('glamdress-selection-v1',JSON.stringify(selected))}catch{toast('Sélection conservée pour cette visite uniquement.')}updateSelection();render()}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}

/* ── Filtres avancés ───────────────────────────────────────────
   Les listes sont construites à partir des données réellement
   présentes dans catalog.js. Un filtre dont aucune fiche ne
   remplit la condition reste masqué (pas de filtre inutile). */
const BUDGETS=[
  {key:'low',label:'Jusqu’à 400 DT',test:v=>v<=400},
  {key:'mid',label:'400 – 700 DT',test:v=>v>400&&v<=700},
  {key:'high',label:'Plus de 700 DT',test:v=>v>700}
];
/* ── Boutons de catégorie ──────────────────────────────────────
   Construits à partir des catégories réellement présentes dans
   catalog.js : ajouter une catégorie (ex. « Cérémonie ») suffit,
   il n'y a plus rien à modifier dans index.html. */
function buildCategoryButtons(){
  const box=$('.filters');
  if(!box)return;
  const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))];
  if(!cats.length)return;
  if(filter!=='Tous'&&!cats.includes(filter))filter='Tous';
  const labels={'Tous':'Tout découvrir'};
  box.replaceChildren();
  ['Tous',...cats].forEach(cat=>{
    const b=document.createElement('button');
    b.type='button';
    b.dataset.filter=cat;
    b.textContent=labels[cat]||cat;
    const on=cat===filter;
    if(on)b.classList.add('active');
    b.setAttribute('aria-pressed',on);
    box.appendChild(b);
  });
}

function buildFilters(){
  const box=$('#advancedFilters');
  if(!box)return;
  const colors=[...new Set(products.map(p=>p.colorName).filter(Boolean))];
  const sizes=[...new Set(products.flatMap(p=>Array.isArray(p.sizes)?p.sizes:[]))];
  const modes=[...new Set(products.map(p=>p.mode).filter(Boolean))];
  const hasPrice=products.some(p=>p.priceFrom);
  const groups=[];
  if(colors.length>1)groups.push({id:'color',label:'Couleur',options:colors.map(c=>({value:c,label:c}))});
  if(sizes.length)groups.push({id:'size',label:'Taille',options:sizes.map(s=>({value:s,label:s}))});
  if(modes.length)groups.push({id:'mode',label:'Formule',options:modes.map(m=>({value:m,label:m}))});
  if(hasPrice)groups.push({id:'budget',label:'Budget',options:BUDGETS.map(b=>({value:b.key,label:b.label}))});
  box.innerHTML=groups.map(g=>`<label class="adv-field"><span>${g.label}</span><select data-adv="${g.id}"><option value="">Toutes</option>${g.options.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select></label>`).join('')+'<button type="button" class="text-link adv-reset" id="resetFilters" hidden>Réinitialiser les filtres</button>';
  box.hidden=!groups.length;
  box.addEventListener('change',e=>{const s=e.target.closest('[data-adv]');if(!s)return;adv[s.dataset.adv]=s.value;render()});
  box.addEventListener('click',e=>{if(e.target.closest('#resetFilters'))resetFilters()});
}
function resetFilters(){
  filter='Tous';Object.keys(adv).forEach(k=>adv[k]='');
  $$('[data-filter]').forEach(x=>{const on=x.dataset.filter==='Tous';x.classList.toggle('active',on);x.setAttribute('aria-pressed',on)});
  $$('[data-adv]').forEach(s=>{s.value=''});
  const search=$('#search');if(search)search.value='';
  render();
}
function matches(p){
  if(filter!=='Tous'&&filter!==p.cat)return false;
  if(adv.color&&p.colorName!==adv.color)return false;
  if(adv.size&&!(Array.isArray(p.sizes)&&p.sizes.includes(adv.size)))return false;
  if(adv.mode&&p.mode!==adv.mode)return false;
  if(adv.budget){const b=BUDGETS.find(b=>b.key===adv.budget);if(!b||!p.priceFrom||!b.test(p.priceFrom))return false}
  const q=normalize($('#search').value.trim());
  if(!q)return true;
  return normalize([p.name,p.cat,p.colorName,p.ref,p.description].filter(Boolean).join(' ')).includes(q);
}
function render(){
  const list=products.filter(matches);
  $('#products').innerHTML=list.map(p=>`<article><div class="product-art"><button class="art-open" data-open="${p.id}" aria-label="Découvrir ${p.name}">${art(p)}</button><span class="badge">INSPIRATION · ${p.id}</span><button class="save" data-save="${p.id}" aria-label="${selected.some(x=>x.id===p.id)?'Retirer':'Ajouter'} ${p.name} ${selected.some(x=>x.id===p.id)?'de':'à'} ma sélection" aria-pressed="${selected.some(x=>x.id===p.id)}">${selected.some(x=>x.id===p.id)?'♥':'♡'}</button></div><div class="product-meta"><span>${p.cat.toUpperCase()}${p.colorName?' · '+p.colorName.toUpperCase():''}</span><h3><button data-open="${p.id}">${p.name}</button></h3><p>${priceLabel(p)} <span aria-hidden="true">↗</span></p></div></article>`).join('');
  $('#noResults').hidden=!!list.length;
  $('#results').textContent=`${list.length} inspiration(s) affichée(s).`;
  const active=(filter!=='Tous')||Object.values(adv).some(Boolean)||!!$('#search').value.trim();
  const reset=$('#resetFilters');if(reset)reset.hidden=!active;
}
function updateSelection(){
  $('#count').textContent=selected.length;
  $('#selectedItems').replaceChildren();
  if(!selected.length)$('#selectedItems').textContent='Votre sélection est vide. Explorez les inspirations et touchez le cœur pour les retrouver ici.';
  selected.forEach(x=>{const p=products.find(p=>p.id===x.id);const row=document.createElement('div');row.className='selected-item';const info=document.createElement('div');const h=document.createElement('h3');h.textContent=p.name;const desc=document.createElement('p');desc.textContent=`${p.id} · Taille souhaitée : ${x.size} · Inspiration uniquement`;info.append(h,desc);const b=document.createElement('button');b.textContent='Retirer';b.setAttribute('aria-label',`Retirer ${p.name}`);b.onclick=()=>{selected=selected.filter(s=>s.id!==x.id);persist()};row.append(info,b);$('#selectedItems').append(row)});
  $('#clear').hidden=!selected.length;
  const share=$('#shareSelection');if(share)share.hidden=!selected.length;
  $('#formSelection').textContent=selected.length?`${selected.length} inspiration(s) de votre sélection seront jointes à la demande.`:'Vous pouvez aussi envoyer une demande sans sélection.';
}
function toggle(id){if(selected.some(x=>x.id===id)){selected=selected.filter(x=>x.id!==id);toast('Inspiration retirée de votre sélection.')}else{if(selected.length>=4){toast('Quatre inspirations au maximum : retirez-en une pour en ajouter une autre.');return}selected.push({id,size:'À préciser'});toast('Inspiration ajoutée à votre sélection.')}persist()}
function openProduct(id){
  const p=products.find(p=>p.id===id);
  const options=SIZES.map(s=>`<option>${s}</option>`).join('');
  const gallery=shots(p);
  const thumbs=gallery.length>1?`<div class="shots" role="group" aria-label="Photos de ${p.name}">${gallery.map((src,i)=>`<button type="button" data-shot="${i}" aria-pressed="${i===0}" aria-label="Photo ${i+1} sur ${gallery.length}"><img src="${src}" alt="" loading="lazy"></button>`).join('')}</div>`:'';
  $('#productContent').innerHTML=`<div class="product-art">${art(p)}</div>${thumbs}<p class="eyebrow">${p.cat.toUpperCase()} · ${p.id}${p.ref?' · réf. '+p.ref:''}</p><h2>${p.name}</h2><p>${p.description}</p><p><strong>Illustration temporaire — pas un modèle disponible.</strong> Les photos, tailles, tarifs et modalités d’achat ou de location seront à confirmer en boutique.</p><dl class="product-facts"><div><dt>Tarifs</dt><dd>${priceLabel(p)}</dd></div><div><dt>Tailles</dt><dd>${Array.isArray(p.sizes)&&p.sizes.length?p.sizes.join(' · '):'À préciser en boutique'}</dd></div><div><dt>Formule</dt><dd>${p.mode||'Achat ou location, à confirmer'}</dd></div></dl><label>Taille habituelle (indicative)<select id="size">${options}</select></label><button class="button" id="addProduct">Enregistrer dans ma sélection ↗</button>`;
  const main=$('#productContent .product-art img');
  if(main&&gallery.length>1){
    $('#productContent .shots').addEventListener('click',e=>{
      const b=e.target.closest('[data-shot]');if(!b)return;
      main.src=gallery[Number(b.dataset.shot)];
      $$('#productContent .shots [data-shot]').forEach(x=>x.setAttribute('aria-pressed',x===b));
    });
  }
  $('#size').value=selected.find(x=>x.id===id)?.size||'À préciser';
  $('#addProduct').onclick=()=>{selected=selected.filter(x=>x.id!==id);selected.push({id,size:$('#size').value});persist();closeDialog($('#product'));toast('Inspiration et taille enregistrées.')};
  showDialog($('#product'));
}

/* ── Partage ────────────────────────────────────────────────── */
async function shareSelection(){
  const url=shareUrl();
  const text=selected.length?`Ma sélection Glam Dress by HBR : ${selected.map(x=>products.find(p=>p.id===x.id).name).join(', ')}`:'Ma sélection Glam Dress by HBR';
  if(navigator.share){
    try{await navigator.share({title:'Ma sélection — Glam Dress by HBR',text,url});return}catch(err){if(err&&err.name==='AbortError')return}
  }
  try{await navigator.clipboard.writeText(url);toast('Lien de votre sélection copié. Collez-le dans WhatsApp.')}
  catch{window.prompt('Copiez ce lien pour partager votre sélection :',url)}
}

$('#products').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.open)openProduct(b.dataset.open);if(b?.dataset.save)toggle(b.dataset.save)});
$('.filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});render()});
$('#search').addEventListener('input',render);
$('#openSelection').onclick=()=>showDialog($('#selection'));
$$('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.closest('dialog')));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)}}));
$('#clear').onclick=()=>{selected=[];persist();toast('Sélection vidée.')};
$('#selectionContact').onclick=()=>{closeDialog($('#selection'));location.hash='contact';$('#booking input').focus({preventScroll:true})};
const shareBtn=$('#shareSelection');if(shareBtn)shareBtn.onclick=shareSelection;
/* Si le lien partagé arrive sur la page sans script de partage, on recharge la sélection. */
if(location.search.includes('sel='))readSharedSelection();
$('#menu').onclick=()=>{const state=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',state);$('#menu').setAttribute('aria-label',state?'Fermer le menu':'Ouvrir le menu')};
$('#nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}});
/* Ferme le menu mobile au clic/tap extérieur, au clic sur le logo, ou à Échap */
function closeNav(){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#menu').setAttribute('aria-label','Ouvrir le menu')}
document.addEventListener('click',e=>{if(!$('#nav').classList.contains('open'))return;if(e.target.closest('#nav')||e.target.closest('#menu'))return;closeNav()});
document.addEventListener('touchstart',e=>{if(!$('#nav').classList.contains('open'))return;if(e.target.closest('#nav')||e.target.closest('#menu'))return;closeNav()},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#nav').classList.contains('open'))closeNav()});

const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;$('#date').min=today;$('#year').textContent=now.getFullYear();
$('#booking').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const f=new FormData(form);if(!String(f.get('name')).trim()){$('#formStatus').textContent='Merci de préciser votre prénom.';return}if(f.get('date')<today){$('#formStatus').textContent='Veuillez choisir une date à partir d’aujourd’hui.';return}const date=new Date(f.get('date')+'T12:00:00').toLocaleDateString('fr-FR');const selection=selected.length?selected.map(x=>{const p=products.find(p=>p.id===x.id);return `- ${p.id} ${p.name}, taille souhaitée : ${x.size}`}).join('\n'):'Aucune inspiration sélectionnée.';const text=`Bonjour Glam Dress by HBR,\nJe m’appelle ${String(f.get('name')).trim()}. Je souhaite demander un essayage.\nOccasion : ${f.get('occasion')}\nRecherche : ${f.get('service')}\nDate souhaitée : ${date} (à confirmer)\nCréneau : ${f.get('creneau')||'sans préférence'}\n\nMes inspirations (illustrations, pas des modèles du catalogue) :\n${selection}\n\nMes envies : ${String(f.get('message')).trim()||'À discuter ensemble.'}\n\nPouvez-vous me confirmer les disponibilités, les modèles réels et les tarifs en DT ?`;const url='https://wa.me/21654218118?text='+encodeURIComponent(text);window.open(url,'_blank','noopener,noreferrer');$('#formStatus').replaceChildren(document.createTextNode('Envoyez le message dans WhatsApp pour transmettre votre demande. Si rien ne s’ouvre : '));const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent='ouvrir WhatsApp';a.style.textDecoration='underline';$('#formStatus').append(a)});

buildCategoryButtons();buildFilters();render();updateSelection();
