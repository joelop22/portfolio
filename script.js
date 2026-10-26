const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const fadeObserver = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');fadeObserver.unobserve(entry.target);}}),{threshold:0.06});
let worksCache = [];
const safeURL = value => {if(/^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/.test(value))return value;try {const u = new URL(value, location.href);return ['https:','http:'].includes(u.protocol) ? u.href : '';}catch{return '';}};
function workCard(work) {
 const card=document.createElement('button');card.type='button';card.className='work-card fade-up';
 const label=(work.title||'').trim()||(work.category==='photography'?'Photography study':'Visual study');card.setAttribute('aria-label','View '+label);
 const img=document.createElement('img');img.src=safeURL(work.image);img.alt=label;img.className='work-img';img.loading='lazy';img.decoding='async';
 const info=document.createElement('div');info.className='work-info';const title=document.createElement('h4');title.textContent=label;const arrow=document.createElement('span');arrow.textContent='↗';info.append(title,arrow);card.append(img,info);
 card.addEventListener('click',()=>openModal(img.src,img.alt));fadeObserver.observe(card);return card;
}
function renderWorks(works){
 const status=document.getElementById('gallery-status');if(status)status.hidden=works.length>0;
 const categories=['product-posters','image-manipulation','social-media-ads','movie-posters','photography'];
 categories.forEach(category=>{const grid=document.getElementById('grid-'+category);if(!grid)return;const all=works.filter(w=>w.category===category);const selected=all.filter(w=>w.showOnIndex===true);grid.replaceChildren(...(selected.length?selected:all).slice(0,4).map(workCard));document.getElementById('cat-'+category).classList.toggle('empty',!all.length);});
 const full=document.getElementById('full-works-grid');if(full){const selected=works.filter(w=>w.category===document.body.dataset.category);full.replaceChildren(...selected.map(workCard));if(!selected.length)full.textContent='No work is available in this collection yet.';}
}
async function loadWorks(){
 try{const response=await fetch('assets/works.json');if(response.ok){worksCache=await response.json();renderWorks(worksCache);}}catch{}
 try{const cached=JSON.parse(localStorage.getItem('portfolioWorksCache')||'[]');if(Array.isArray(cached)&&cached.length){worksCache=cached;renderWorks(cached);}}catch{}
 try{
 let works;
 if(typeof db!=='undefined'&&db){const snapshot=await Promise.race([db.collection('portfolioWorks').get(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Connection timed out')),12000))]);works=snapshot.docs.map(doc=>doc.data());}
 else throw new Error('Gallery connection unavailable');
 worksCache=works;renderWorks(works);try{localStorage.setItem('portfolioWorksCache',JSON.stringify(works));}catch{}
 if(!works.length){const status=document.getElementById('gallery-status');if(status)status.textContent='New work is on its way. Explore my digital projects below.';}
 }catch(error){if(!worksCache.length){const status=document.getElementById('gallery-status')||document.getElementById('full-works-grid');if(status){status.replaceChildren(document.createTextNode('The gallery couldn’t load. '));const retry=document.createElement('button');retry.textContent='Try again';retry.addEventListener('click',()=>{status.textContent='Loading artwork…';loadWorks();});status.append(retry);const link=document.createElement('a');link.href='https://www.behance.net/joelshajanv';link.textContent=' View work on Behance ↗';status.append(link);}}}
}
let artworkDialog,returnFocus;
function setupModal(){artworkDialog=document.createElement('dialog');artworkDialog.className='artwork-dialog';artworkDialog.setAttribute('aria-label','Artwork preview');artworkDialog.innerHTML='<button class="modal-close" aria-label="Close artwork">×</button><img class="modal-img" alt=""><p class="modal-info"></p>';document.body.append(artworkDialog);artworkDialog.querySelector('button').addEventListener('click',()=>artworkDialog.close());artworkDialog.addEventListener('click',e=>{if(e.target===artworkDialog)artworkDialog.close();});artworkDialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus();});}
function openModal(src,title){returnFocus=document.activeElement;artworkDialog.querySelector('img').src=src;artworkDialog.querySelector('img').alt=title;artworkDialog.querySelector('p').textContent=title;artworkDialog.showModal();document.body.style.overflow='hidden';}
const digitalProjects = [
  {id:'design-dna',title:'Design DNA',type:'Design analysis · Web app',mark:'DNA',image:'assets/digital/design-dna-logo.svg',description:'A visual design analysis platform exploring typography, color, composition and the principles behind effective design.',url:'https://www.dnadesign.in/'},
  {id:'penny',title:'Penny',type:'Personal finance · Android app',mark:'₹',image:'assets/digital/penny-logo.svg',description:'An Android personal finance app designed to make daily money management easier, with spending history, daily allowance, monthly bills and a home-screen widget.'},
  {id:'max-assistant',title:'MAX Assistant',type:'Voice assistant · Android app',mark:'MAX',image:'assets/digital/max-logo.svg',screenshots:[{src:'assets/digital/max-home.webp',label:'Home'},{src:'assets/digital/max-commands.webp',label:'Voice commands'},{src:'assets/digital/max-settings.webp',label:'Settings'}],description:'An experimental Android voice assistant designed for natural spoken commands, including calling selected contacts, WhatsApp messaging and music playback controls.'},
  {id:'akshythks',title:'Akshyth Portfolio',type:'Portfolio · Website',mark:'01',image:'assets/digital/akshyth-logo.svg',description:'A responsive portfolio website focused on presenting creative work through a clear and modern digital experience.',url:'https://akshythks.vercel.app/'},
  {id:'rahul-guitar',title:'Rahul David Guitar Lessons',type:'Music lessons · Website',mark:'02',image:'assets/digital/rahul-david-logo.svg',description:'A website for Rahul David Guitar Lessons, presenting music education through an accessible and responsive online experience.',url:'https://rahul-david-guitar-lessons.vercel.app/'}
];
const setupDigitalProducts = () => {
  const grid = document.getElementById('grid-digital-products');
  const more = document.getElementById('digital-view-more');
  if (!grid || !more) return;
  let expanded = false;
  const modal = document.createElement('div');
  modal.className = 'digital-modal';
  modal.hidden = true;
  modal.innerHTML = '<div class="digital-modal-panel" role="dialog" aria-modal="true" aria-labelledby="digital-modal-title"><button type="button" class="digital-modal-close" aria-label="Close project details">×</button><div class="digital-modal-label"></div><h3 id="digital-modal-title"></h3><div class="digital-modal-visual"></div><p class="digital-modal-description"></p><a class="digital-modal-link" target="_blank" rel="noopener noreferrer">Visit website <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div>';
  document.body.appendChild(modal);
  const close = modal.querySelector('.digital-modal-close');
  let previousFocus = null;
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; previousFocus?.focus(); };
  close.addEventListener('click',closeModal);
  modal.addEventListener('click',e => {if(e.target === modal)closeModal();});
  document.addEventListener('keydown',e => {
    if(modal.hidden)return;
    if(e.key === 'Escape')closeModal();
    if(e.key === 'Tab'){
      const focusables = [...modal.querySelectorAll('button,a:not([hidden])')].filter(el=>!el.hidden);
      if(!focusables.length)return;
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  const visual = (project,full=false) => {
    const wrap=document.createElement('div');
    wrap.className=full?'digital-modal-visual':'digital-card-art';
    if(project.image){
      const img=document.createElement('img');img.src=project.image;img.alt=project.title+' logo';img.loading='lazy';
      if(!full)img.className='digital-cover';
      img.onerror=()=>{wrap.replaceChildren();const label=document.createElement('strong');label.textContent=project.mark;wrap.appendChild(label);};
      wrap.appendChild(img);
    }else{const label=document.createElement('strong');label.textContent=project.mark;wrap.appendChild(label);}
    return wrap;
  };
  const openProject = (project) => {
    previousFocus=document.activeElement;
    modal.querySelector('.digital-modal-label').textContent=project.type;
    modal.querySelector('#digital-modal-title').textContent=project.title;
    modal.querySelector('.digital-modal-description').textContent=project.description;
    modal.querySelector('.digital-modal-visual').replaceWith(visual(project,true));
    const oldGallery=modal.querySelector('.digital-screenshots');
    if(oldGallery)oldGallery.remove();
    if(project.screenshots?.length){
      const gallery=document.createElement('section');gallery.className='digital-screenshots';gallery.setAttribute('aria-label',project.title+' screenshots');
      const heading=document.createElement('h4');heading.textContent='App screenshots';gallery.appendChild(heading);
      const track=document.createElement('div');track.className='digital-screenshot-track';track.tabIndex=0;track.setAttribute('aria-label','Swipe left or right to browse screenshots');
      project.screenshots.forEach((shot,i)=>{
        const item=document.createElement('figure');item.className='digital-screenshot-item';
        const img=document.createElement('img');img.src=shot.src;img.alt=project.title+' — '+shot.label;img.loading='lazy';
        img.onerror=()=>{item.hidden=true; if(![...track.children].some(el=>!el.hidden))gallery.hidden=true;};
        const caption=document.createElement('figcaption');caption.textContent=shot.label;
        item.append(img,caption);track.appendChild(item);
      });
      gallery.appendChild(track);
      const controls=document.createElement('div');controls.className='digital-screenshot-controls';
      const prev=document.createElement('button');prev.type='button';prev.textContent='←';prev.setAttribute('aria-label','Previous screenshot');
      const next=document.createElement('button');next.type='button';next.textContent='→';next.setAttribute('aria-label','Next screenshot');
      const move=(direction)=>{const first=track.querySelector('figure:not([hidden])');track.scrollBy({left:direction*(first?.getBoundingClientRect().width||220)+direction*16,behavior:'smooth'});};
      prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
      controls.append(prev,next);gallery.appendChild(controls);
      modal.querySelector('.digital-modal-description').after(gallery);
    }
    const link=modal.querySelector('.digital-modal-link');
    link.hidden=!project.url;
    if(project.url)link.href=project.url;else link.removeAttribute('href');
    modal.hidden=false;document.body.style.overflow='hidden';close.focus();
  };
  digitalProjects.forEach((project,index)=>{
    const card=document.createElement('button');
    card.type='button';card.className='work-card digital-card fade-up';
    card.hidden=index>=5;
    card.setAttribute('aria-label','View details for '+project.title);
    card.appendChild(visual(project));
    const info=document.createElement('div');info.className='work-info';
    const heading=document.createElement('h4');heading.textContent=project.title;
    const type=document.createElement('p');type.textContent=project.type;
    info.append(heading,type);card.appendChild(info);
    card.addEventListener('click',()=>openProject(project));
    grid.appendChild(card);
    if(typeof fadeObserver!=='undefined')fadeObserver.observe(card);
  });
  const updateMore=()=>{
    const extras=[...grid.children].slice(5);
    extras.forEach(card=>card.hidden=!expanded);
    more.hidden=extras.length===0;
    more.setAttribute('aria-expanded',String(expanded));
    more.innerHTML=expanded?'Show Less <i class="fas fa-chevron-up" aria-hidden="true"></i>':'View More <i class="fas fa-chevron-down" aria-hidden="true"></i>';
  };
  more.addEventListener('click',()=>{expanded=!expanded;updateMore();});
  updateMore();
};




function setupTextMotion(){
 if(reduceMotion.matches)return;
 const animations=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  entry.target.querySelectorAll('.motion-word').forEach((word,i)=>{
   const animation=word.animate([
    {opacity:0,transform:'translateY(28px) rotate(2deg)',filter:'blur(3px)'},
    {opacity:1,transform:'translateY(0) rotate(0)',filter:'blur(0)'}
   ],{duration:850,delay:Math.min(i*65,400),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   animations.add(animation);animation.onfinish=()=>animations.delete(animation);
  });
 }),{threshold:.2});
 document.querySelectorAll('.hero h1,.section-head h2,.about-copy h2,.collection-page h1,.category-head h3,.contact-title,.hero-eyebrow,.eyebrow').forEach(heading=>{
  const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);const nodes=[];
  while(walker.nextNode()){if(walker.currentNode.textContent.trim()&&!walker.currentNode.parentElement.closest('[aria-hidden]'))nodes.push(walker.currentNode);}
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{
   if(!word.trim()){fragment.append(document.createTextNode(word));return;}
   const span=document.createElement('span');span.className='motion-word';span.textContent=word;fragment.append(span);
  });node.replaceWith(fragment);});observer.observe(heading);
 });
 reduceMotion.addEventListener('change',event=>{if(event.matches){observer.disconnect();animations.forEach(a=>a.cancel());animations.clear();}});
}

function setupInteractions(){
 document.querySelectorAll('.section-head,.about-copy,.about-image,.category-head').forEach(el=>{el.classList.add('fade-up');fadeObserver.observe(el);});
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelectorAll('.work-category:not(.digital-section)').forEach(section=>{section.hidden=button.dataset.filter!=='all'&&section.id!=='cat-'+button.dataset.filter;});}));
 let pending=false;const scroll=()=>{pending=false;const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',max>0?scrollY/max:0);document.querySelector('nav')?.classList.toggle('scrolled',scrollY>30);};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(scroll);}},{passive:true});scroll();
 const star=document.querySelector('.hero-star');if(star&&!reduceMotion.matches){let angle=0;star.addEventListener('pointerenter',()=>{angle+=90;star.style.transform=`rotate(${angle}deg)`;});}
 const logo=document.querySelector('nav .logo');let taps=0,timer;logo?.addEventListener('click',e=>{if(logo.getAttribute('href')==='#'){e.preventDefault();window.scrollTo({top:0,behavior:reduceMotion.matches?'instant':'smooth'});}clearTimeout(timer);if(++taps===5)location.href='login.html';timer=setTimeout(()=>taps=0,1000);});
}
document.addEventListener('DOMContentLoaded',()=>{setupModal();setupDigitalProducts();setupInteractions();setupTextMotion();loadWorks();});
