import { chapterPage, pageChapter } from './portfolio-book-state.mjs?v=2';
import { BOOK_CATEGORIES, orderChapters, matchesChapter } from './portfolio-catalog.mjs?v=1';

function initBook() {
  const section = document.querySelector('#projects');
  if (!section) return;
  const source = [...section.querySelectorAll('.featured-project,.project-card')];
  if (!source.length) return;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const text = (node) => node?.textContent.trim().replace(/\s+/g, ' ') || '';
  const make = (tag, cls, value) => {
    const el = document.createElement(tag); el.className = cls;
    if(value) el.textContent=value; return el;
  };
  const chapters = orderChapters(source.map((article,i) => ({
    title:text(article.querySelector('h3')), article, index:i,
    category:article.dataset.bookCategory,
    icon:article.querySelector('.featured-visual img,.project-card-head img'),
    label:text(article.querySelector('.project-meta,.project-label')),
    intro:text(article.querySelector('.featured-copy > p')) || text(article.querySelector(':scope > p')),
    links:[...article.querySelectorAll('.project-actions a,:scope > a')],
    notes:text(article.querySelector('.project-notes,.launch-strip'))
  })));
  const shell=make('div','epic-library');
  shell.innerHTML=`<div class="epic-library-top"><div><h3>锻造之书</h3><p>翻过一页，走进一个作品。</p></div><div class="epic-view-tools"><button type="button" class="epic-catalog-toggle" aria-expanded="false">目录</button><button type="button" class="epic-list-toggle" aria-pressed="false">列表阅读</button></div></div><div class="epic-library-layout"><aside class="epic-catalog" aria-label="锻造之书目录"><label class="epic-search-label">查找作品<input type="search" placeholder="搜索项目名称" aria-label="搜索项目名称"></label><nav class="epic-chapters"></nav><p class="epic-no-results" hidden>没有匹配的作品</p><p class="epic-catalog-note">目录可以直接跳转，<br>不必从第一页开始。</p></aside><div class="epic-desk"><div class="epic-book-wrap"><div class="epic-book" aria-label="可翻阅的项目作品册"></div></div><div class="epic-book-controls"><button type="button" data-book-action="prev" aria-label="上一页">←</button><div><output class="epic-page-status" aria-live="polite"></output><span>拖动页角 · 点击箭头翻页</span></div><button type="button" data-book-action="next" aria-label="下一页">→</button></div><div class="epic-chapter-controls"><button type="button" data-book-action="previous-chapter">上一作品</button><button type="button" data-book-action="cover">查看封面</button><button type="button" data-book-action="next-chapter">下一作品</button></div></div></div>`;
  section.querySelector('.section-header').after(shell);
  const bookEl=shell.querySelector('.epic-book'), nav=shell.querySelector('.epic-chapters');
  const groups=new Map();
  for(const category of BOOK_CATEGORIES){
    const members=chapters.filter(ch=>ch.category===category);if(!members.length)continue;
    const group=make('section','epic-chapter-group'),heading=make('h4','',category);
    heading.append(make('span','',String(members.length)));
    const items=make('div','epic-chapter-items');group.append(heading,items);nav.append(group);groups.set(category,items);
  }
  const returnCover=make('button','epic-return-cover','返回封面');returnCover.type='button';returnCover.dataset.bookAction='cover';nav.before(returnCover);
  const pageNodes=[];
  function page(cls) {
    const p=make('section','epic-paper '+cls);
    const inner=make('div','epic-paper-inner'); p.append(inner); bookEl.append(p);pageNodes.push(p);return inner;
  }
  const cover=page('epic-cover'); cover.parentElement.dataset.density='hard';
  cover.innerHTML='<span class="epic-cover-author">杨锟 · Killian Yang</span><div class="epic-cover-sword" aria-hidden="true"></div><h4>锻造之书</h4><p>从 AI 创意，到产品落地。</p><button type="button" data-book-action="open">打开作品册 →</button><span class="epic-cover-bottom">AI 产品 builder</span>';
  for (const ch of chapters) {
    const b=make('button','epic-chapter',ch.title); b.type='button';b.dataset.chapter=ch.index;
    const small=make('span','',String(ch.index+1).padStart(2,'0'));b.prepend(small);groups.get(ch.category).append(b);
    const left=page('epic-project-face');left.parentElement.dataset.chapter=ch.index;
    left.append(make('span','epic-running-head','杨锟 / 作品集'));
    const icon=ch.icon.cloneNode();icon.removeAttribute('style');icon.className='epic-project-icon';icon.loading='lazy';left.append(icon);
    left.append(make('p','epic-project-kind',ch.label),make('h4','epic-project-title',ch.title));
    if(ch.notes) left.append(make('p','epic-project-notes',ch.notes));
    const read=make('button','epic-read', '完整项目与细节 ↗');read.type='button';read.dataset.read=ch.index;left.append(read);
    left.append(make('span','epic-folio',String(ch.index*2+1).padStart(2,'0')));
    const right=page('epic-project-story');right.parentElement.dataset.chapter=ch.index;
    right.append(make('span','epic-running-head',ch.title),make('h4','epic-story-heading','关于这个作品'),make('p','epic-project-intro',ch.intro));
    const contribution=ch.article.querySelector('.project-copy-stack p');
    if(contribution) {
      const excerpt=text(contribution);
      right.append(make('p','epic-project-excerpt',excerpt.length>100?excerpt.slice(0,100)+'…':excerpt));
    }
    const links=make('div','epic-project-links');
    ch.links.slice(0,3).forEach(a=>{const c=a.cloneNode(true);c.className='epic-project-link';c.removeAttribute('style');links.append(c);});
    right.append(links);
    const more=make('button','epic-read','展开完整介绍 ↗');more.type='button';more.dataset.read=ch.index;right.append(more);
    right.append(make('span','epic-folio',String(ch.index*2+2).padStart(2,'0')));
  }
  const back=page('epic-cover');back.parentElement.dataset.density='hard';
  back.innerHTML='<span class="epic-cover-author">未完，待续</span><h4>下一件作品<br>正在路上。</h4><p>想了解更多，欢迎继续交流。</p><a href="#contact">联系我 ↗</a><button type="button" data-book-action="open">回到第一件作品</button>';

  const dialog=make('dialog','epic-details');
  dialog.innerHTML='<div class="epic-details-bar"><span>项目完整介绍</span><button type="button" aria-label="关闭项目介绍">关闭 ×</button></div><article class="epic-details-content"></article>';
  document.body.append(dialog);
  let returnFocus;
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.classList.remove('epic-dialog-open');returnFocus?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  function readChapter(index, trigger) {
    returnFocus=trigger;
    const copy=chapters[index].article.cloneNode(true);
    copy.querySelectorAll('.project-number,.fit-stage-glow,.orbit-label').forEach(e=>e.remove());
    [copy,...copy.querySelectorAll('*')].forEach(e=>{
      e.removeAttribute('id');e.removeAttribute('style');e.removeAttribute('class');
      e.removeAttribute('data-lightbox-image');
      if(e.tagName==='IMG') e.loading='eager';
    });
    const content=dialog.querySelector('.epic-details-content');content.replaceChildren(copy);
    document.body.classList.add('epic-dialog-open');dialog.showModal();dialog.scrollTop=0;
  }
  let fallbackPage=0;
  const fallbackTurn=p=>{fallbackPage=Math.max(0,Math.min(pageNodes.length-1,p));sync(fallbackPage);};
  const fallbackStep=()=>shell.querySelector('.epic-book-wrap').clientWidth<620?1:2;
  let flip={
    getCurrentPageIndex:()=>fallbackPage,getOrientation:()=>fallbackStep()===1?'portrait':'landscape',
    turnToPage:fallbackTurn,flip:fallbackTurn,update:()=>sync(fallbackPage),
    flipNext:()=>fallbackTurn(fallbackPage+fallbackStep()),flipPrev:()=>fallbackTurn(fallbackPage-fallbackStep()),
    turnToNextPage:()=>fallbackTurn(fallbackPage+fallbackStep()),turnToPrevPage:()=>fallbackTurn(fallbackPage-fallbackStep())
  };
  let currentPage=0,currentChapter=0,listMode=false;
  function sync(pageNumber) {
    currentPage=pageNumber;currentChapter=pageChapter(pageNumber,chapters.length);
    const coverState=pageNumber===0||pageNumber===pageNodes.length-1;
    nav.querySelectorAll('.epic-chapter').forEach(b=>{b.setAttribute('aria-current',String(!coverState&&Number(b.dataset.chapter)===currentChapter));});
    shell.querySelector('.epic-page-status').textContent=coverState?'锻造之书':`${chapters[currentChapter].title} · ${currentChapter+1} / ${chapters.length}`;
    shell.querySelector('[data-book-action="prev"]').disabled=pageNumber===0;
    shell.querySelector('[data-book-action="next"]').disabled=pageNumber>=pageNodes.length-1;
    shell.querySelector('[data-book-action="previous-chapter"]').disabled=!currentChapter;
    shell.querySelector('[data-book-action="next-chapter"]').disabled=currentChapter===chapters.length-1;
    const portrait=flip.getOrientation()==='portrait';
    const start=pageNumber===0?0:pageNumber%2===0?pageNumber-1:pageNumber;
    pageNodes.forEach((node,i)=>{const visible=coverState?i===pageNumber:portrait?i===pageNumber:(i===start||i===start+1);node.hidden=!visible;node.inert=!visible;node.setAttribute('aria-hidden',String(!visible));});
    const actions=shell.querySelector('.epic-live-actions');
    if(actions){
      actions.replaceChildren();
      const details=make('button','',coverState?'打开作品册':'完整项目介绍 ↗');details.type='button';
      details.addEventListener('click',()=>coverState?go(1,true):readChapter(currentChapter,details));actions.append(details);
      if(!coverState)chapters[currentChapter].links.slice(0,3).forEach(a=>{const link=a.cloneNode(true);link.className='';link.removeAttribute('style');actions.append(link);});
    }
  }
  function go(pageNumber, animate=false) {
    const target=Math.max(0,Math.min(pageNodes.length-1,pageNumber));
    if(animate&&!reduced.matches) flip.flip(target,'bottom'); else flip.turnToPage(target);
    sync(flip.getCurrentPageIndex());
  }
  sync(fallbackPage);
  // Links and buttons are actions, not page-drag handles (including their SVG children).
  ['mousedown','touchstart'].forEach(type=>bookEl.addEventListener(type,e=>{if(e.target.closest('a,button'))e.stopPropagation();},{capture:true,passive:true}));
  shell.addEventListener('click',e=>{
    const chapter=e.target.closest('[data-chapter].epic-chapter');
    if(chapter){go(chapterPage(Number(chapter.dataset.chapter),chapters.length),true);shell.classList.remove('epic-catalog-open');shell.querySelector('.epic-catalog-toggle').setAttribute('aria-expanded','false');return;}
    const read=e.target.closest('[data-read]');if(read){readChapter(Number(read.dataset.read),read);return;}
    const action=e.target.closest('[data-book-action]')?.dataset.bookAction;
    if(action==='cover') {shell.classList.remove('epic-catalog-open');shell.querySelector('.epic-catalog-toggle').setAttribute('aria-expanded','false');go(0,true);}
    if(action==='open') go(1,true);
    if(action==='next'||action==='prev'){
      const direction=action==='next'?'Next':'Prev';
      if(reduced.matches) flip['turnTo'+direction+'Page']();else flip['flip'+direction]('bottom');
    }
    if(action==='previous-chapter')go(chapterPage(currentChapter-1,chapters.length));
    if(action==='next-chapter')go(chapterPage(currentChapter+1,chapters.length));
  });
  shell.addEventListener('keydown',e=>{
    if(e.target.matches('input')||dialog.open)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      e.preventDefault();shell.querySelector(`[data-book-action="${e.key==='ArrowRight'?'next':'prev'}"]`).click();
    }
    if(e.key==='Home'){e.preventDefault();go(0,true);}
  });
  shell.querySelector('.epic-catalog-toggle').addEventListener('click',e=>{
    const open=shell.classList.toggle('epic-catalog-open');e.currentTarget.setAttribute('aria-expanded',String(open));
  });
  shell.querySelector('input').addEventListener('input',e=>{
    const q=e.target.value.toLowerCase().trim();let found=0;
    nav.querySelectorAll('.epic-chapter').forEach(b=>{b.hidden=!matchesChapter(chapters[Number(b.dataset.chapter)],q);if(!b.hidden)found++;});
    nav.querySelectorAll('.epic-chapter-group').forEach(group=>{group.hidden=![...group.querySelectorAll('.epic-chapter')].some(b=>!b.hidden);});
    shell.querySelector('.epic-no-results').hidden=found>0;
  });
  shell.querySelector('.epic-list-toggle').addEventListener('click',e=>{
    listMode=!listMode;section.classList.toggle('epic-list-mode',listMode);
    e.currentTarget.setAttribute('aria-pressed',String(listMode));e.currentTarget.textContent=listMode?'返回翻书':'列表阅读';
    if(!listMode)flip.update();
    window.ScrollTrigger?.refresh();
  });
  section.classList.add('epic-book-ready');
  window.ScrollTrigger?.refresh();
  const liveActions=make('div','epic-live-actions');shell.querySelector('.epic-book-controls').after(liveActions);
  const upgrade=new IntersectionObserver(async entries=>{
    if(!entries.some(e=>e.isIntersecting))return;upgrade.disconnect();
    try {
      const {createBookScene}=await import('./portfolio-book-3d.js?v=21');
      const scene=await createBookScene(shell.querySelector('.epic-book-wrap'),chapters,{initialPage:currentPage,onPage:sync,readChapter});
      flip=scene;shell.querySelector('.epic-book-wrap').classList.add('epic-3d-active');
      shell.classList.add('epic-spatial');sync(currentPage);window.ScrollTrigger?.refresh();
      if(location.hash==='#projects')requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:'instant'}));
    } catch(error){console.warn('[portfolio book] WebGL unavailable; keeping HTML paper:',error);}
  },{rootMargin:'300px'});
  upgrade.observe(shell);
  if(location.hash==='#projects')requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:'instant'}));
}

try { initBook(); } catch(error) {
  console.warn('[portfolio book] Keeping original project list:',error);
  document.querySelector('#projects')?.classList.remove('epic-book-ready');
  document.querySelector('.epic-library')?.remove();
}
