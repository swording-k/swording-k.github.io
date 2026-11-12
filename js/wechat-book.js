// Use the same printed pages without allocating a WebGL context in the embedded reader.
import { createCrispPage } from './book-page-art.js?v=reading-type-1';

export function createWechatBook(host, chapters, {initialPage,onPage,readChapter}) {
  const stage=document.createElement('div');
  stage.className='wechat-volume';
  stage.setAttribute('role','group');stage.setAttribute('aria-label','立体作品册，左右滑动翻页');
  host.append(stage);
  const count=chapters.length*2+2, reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let current=initialPage, leaf, moving, gesture;
  function update(){
    if(stage.clientWidth)stage.style.setProperty('--ink-scale',stage.clientWidth/768);
  }
  function paint(page){
    const sheet=document.createElement('div');sheet.className='wechat-leaf';
    const ink=createCrispPage(page,count,chapters);ink.classList.add('is-reading-surface');
    sheet.append(ink);return sheet;
  }
  function turn(page,animate=true){
    page=Math.max(0,Math.min(count-1,page));
    if(leaf && page===current)return;
    moving?.finish();
    const old=leaf,forward=page>current;
    current=page;leaf=paint(page);stage.append(leaf);
    if(old && animate && !reduced.matches && typeof leaf.animate==='function'){
      old.inert=true;old.setAttribute('aria-hidden','true');
      const top=forward?old:leaf;top.style.zIndex='1';
      const ends=[{transform:'rotateY(0deg)'},{transform:'rotateY(-93deg)'}];
      const anim=top.animate(forward?ends:ends.reverse(),{duration:390,easing:'ease-in-out',fill:'both'});
      moving=anim;
      anim.onfinish=()=>{old.remove();anim.cancel();top.style.zIndex='';if(moving===anim)moving=null;};
    }else old?.remove();
    onPage(page);
  }
  stage.addEventListener('click',e=>{
    const action=e.target.closest('[data-surface-action]')?.dataset.surfaceAction;
    if(action==='open')turn(1);
    if(action==='prev')turn(current-1);
    if(action==='next')turn(current+1);
    if(action==='read')readChapter(Math.floor((current-1)/2),e.target);
  });
  stage.addEventListener('pointerdown',e=>{
    gesture=e.isPrimary&&!e.target.closest('a,button')?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;
  });
  stage.addEventListener('pointercancel',()=>{gesture=null;});
  stage.addEventListener('pointerup',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;
    if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.4)turn(current+(dx<0?1:-1));
  });
  const observer=new ResizeObserver(update);observer.observe(stage);update();turn(current,false);
  return {getCurrentPageIndex:()=>current,getOrientation:()=>'portrait',
    turnToPage:p=>turn(p,false),flip:turn,flipNext:()=>turn(current+1),flipPrev:()=>turn(current-1),
    turnToNextPage:()=>turn(current+1,false),turnToPrevPage:()=>turn(current-1,false),update,
    dispose(){observer.disconnect();moving?.cancel();stage.remove();}};
}
