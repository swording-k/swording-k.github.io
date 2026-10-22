import {sampleWake,liveWake,wakeStrength} from './sword-wake-state.mjs';

const fine=matchMedia('(pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
const canvas=document.createElement('canvas');canvas.className='sword-wake';canvas.setAttribute('aria-hidden','true');
const ctx=canvas.getContext('2d');
if(ctx) {
  document.body.append(canvas);
  let points=[],raf=0,width=innerWidth,height=innerHeight;
  function resize() {
    if(!fine.matches||reduced.matches)return;
    const dpr=Math.min(devicePixelRatio||1,1.5);width=innerWidth;height=innerHeight;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function clear() {points=[];if(raf)cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,width,height);canvas.dataset.active='false';}
  function frame(now) {
    raf=0;points=liveWake(points,now);ctx.clearRect(0,0,width,height);
    const visible=points.length>2&&points.some(p=>wakeStrength(p.speed,now-p.t)>.01);
    canvas.dataset.active=String(visible);
    if(visible&&points.length>2) {
      ctx.globalAlpha=Math.max(...points.map(p=>wakeStrength(p.speed,now-p.t)));
      const path=points.map((p,i)=>{
        const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
        return {...p,x:(before.x+p.x*2+after.x)/4,y:(before.y+p.y*2+after.y)/4};
      });
      let normal={x:0,y:1};
      const edges=path.map((p,i)=>{
        const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];
        const length=Math.hypot(b.x-a.x,b.y-a.y);
        if(length>.01)normal={x:-(b.y-a.y)/length,y:(b.x-a.x)/length};
        const taper=Math.pow(Math.sin(Math.PI*i/(path.length-1)),.7);
        const half=(1.3+Math.min(p.speed,3)*2.2)*wakeStrength(p.speed,now-p.t)*taper;
        return {left:{x:p.x+normal.x*half,y:p.y+normal.y*half},right:{x:p.x-normal.x*half,y:p.y-normal.y*half}};
      });
      const first=path[0],last=path.at(-1);
      const end=Math.hypot(last.x-first.x,last.y-first.y)>4?last:path.reduce((a,p)=>Math.hypot(p.x-first.x,p.y-first.y)>Math.hypot(a.x-first.x,a.y-first.y)?p:a,first);
      const light=ctx.createLinearGradient(first.x,first.y,end.x===first.x&&end.y===first.y?first.x+1:end.x,end.y);
      light.addColorStop(0,'#cab18400');light.addColorStop(.35,'#ceb88a66');light.addColorStop(.72,'#f3eee6cc');light.addColorStop(1,'#fffdf000');
      ctx.beginPath();
      edges.map(p=>p.left).concat(edges.map(p=>p.right).reverse()).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.closePath();ctx.fillStyle=light;ctx.fill();
      ctx.beginPath();ctx.moveTo(first.x,first.y);
      for(let i=1;i<path.length-1;i++){const p=path[i],next=path[i+1];ctx.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);}
      ctx.lineTo(last.x,last.y);ctx.strokeStyle=light;ctx.lineWidth=.8;ctx.shadowColor='#e8dcc2';ctx.shadowBlur=4;ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
    }
    if(points.length)raf=requestAnimationFrame(frame);
  }
  document.addEventListener('pointermove',event=>{
    const target=event.target instanceof Element?event.target:null;
    const blocked=event.pointerType==='touch'||!fine.matches||reduced.matches||event.buttons!==0||!target?.closest('#hero')||!!target.closest('a,button,input,textarea,select,.hero-copy,.console-body,.console-topbar,.stage-caption,[role="button"]');
    if(blocked){clear();return;}
    points=sampleWake(points,{x:event.clientX,y:event.clientY},performance.now());
    if(!raf)raf=requestAnimationFrame(frame);
  },{passive:true});
  document.addEventListener('pointerdown',clear,{passive:true});
  document.addEventListener('mouseleave',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  window.addEventListener('scroll',clear,{passive:true});
  window.addEventListener('blur',clear);window.addEventListener('resize',()=>{clear();resize();},{passive:true});
  function updateMode(){clear();canvas.hidden=!fine.matches||reduced.matches;if(!canvas.hidden)resize();}
  reduced.addEventListener('change',updateMode);fine.addEventListener('change',updateMode);
  updateMode();
}
