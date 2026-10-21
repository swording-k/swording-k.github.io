import * as THREE from './vendor/three.module.min.js';
import { sheetStrip } from './book-surface.mjs';
import { adjacentPage } from './portfolio-book-state.mjs?v=2';

// Real geometry, lighting and two independently typeset paper faces.
export async function createBookScene(host, chapters, {initialPage=1,onPage,readChapter}) {
  const W=2.65,H=3.65, count=chapters.length*2+2;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.className='epic-webgl';renderer.domElement.setAttribute('aria-label','立体作品册，拖动纸页左右翻阅');
  renderer.domElement.setAttribute('role','img');host.append(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(35,1,.1,50), book=new THREE.Group();
  scene.add(book,new THREE.HemisphereLight(0xf4f7ff,0x30362b,1.5));
  const lamp=new THREE.DirectionalLight(0xfff5e5,2.3);lamp.position.set(-3,1,7);lamp.castShadow=true;
  lamp.shadow.mapSize.set(1024,1024);lamp.shadow.camera.left=-5;lamp.shadow.camera.right=5;lamp.shadow.camera.top=5;lamp.shadow.camera.bottom=-5;lamp.shadow.normalBias=.025;lamp.shadow.bias=-.0003;lamp.shadow.radius=4;scene.add(lamp);
  const fill=new THREE.DirectionalLight(0xbad5f0,.7);fill.position.set(4,-2,4);scene.add(fill);
  const leather=new THREE.MeshStandardMaterial({color:0x19201a,roughness:.82,metalness:.07});
  const brass=new THREE.MeshStandardMaterial({color:0xa08046,roughness:.36,metalness:.75});
  const paper=new THREE.MeshStandardMaterial({color:0xbeb49b,roughness:1});
  function box(w,h,d,x,z,mat) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,0,z);m.castShadow=true;m.receiveShadow=true;book.add(m);return m;
  }
  const leftBase=box(W+.12,H+.14,.075,-W/2,-.185,leather);
  const rightBase=box(W+.12,H+.14,.075,W/2,-.185,leather);
  const leftStack=box(W-.03,H-.035,.145,-W/2,-.075,paper);
  const rightStack=box(W-.03,H-.035,.145,W/2,-.075,paper);
  const spine=box(.12,H+.1,.2,0,-.1,leather);
  // Fine physical page edges and metal corners, not a flat shadow illustration.
  const edges=new THREE.Group();book.add(edges);
  for(const side of [-1,1]) {
    for(let i=0;i<8;i++) {
      const edge=new THREE.Mesh(new THREE.BoxGeometry(W,.009,.003),new THREE.MeshStandardMaterial({color:i%2?0xb1a487:0xd8ccb1,roughness:1}));
      edge.position.set(side*W/2,-H/2-.002,-.14+i*.017);edges.add(edge);
    }
    for(const y of [-1,1]) {
      const metal=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.018),brass);
      metal.position.set(side*(W-.06),y*(H/2-.03),-.13);book.add(metal);
    }
  }
  const table=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.MeshBasicMaterial({color:0x111611}));
  table.position.z=-.25;scene.add(table);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.ShadowMaterial({color:0x000000,opacity:.6}));
  shadow.position.z=-.249;shadow.receiveShadow=true;scene.add(shadow);
  const mats=[0,1].map(()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94}));
  const left=new THREE.Mesh(new THREE.PlaneGeometry(W,H),mats[0]);left.position.set(-W/2,0,.006);left.receiveShadow=true;book.add(left);
  const right=new THREE.Mesh(new THREE.PlaneGeometry(W,H),mats[1]);right.position.set(W/2,0,.009);right.receiveShadow=true;book.add(right);
  const geom=new THREE.PlaneGeometry(W,H,36,12);geom.translate(W/2,0,0);
  const backGeom=geom.clone(), uv=backGeom.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
  const frontMat=new THREE.MeshStandardMaterial({side:THREE.FrontSide,roughness:.94});
  const backMat=new THREE.MeshStandardMaterial({side:THREE.BackSide,roughness:.94});
  const front=new THREE.Mesh(geom,frontMat),back=new THREE.Mesh(backGeom,backMat);
  for(const m of [front,back]){m.castShadow=true;m.receiveShadow=true;m.visible=false;m.frustumCulled=false;book.add(m);}
  let current=initialPage, animation=null, raf=0, portrait=false, drag=null, disposed=false;
  const textures=new Map(),targetRotation={x:0,y:0};
  function draw(){if(!disposed)renderer.render(scene,camera);}
  function requestDraw(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw();});}
  function wrap(ctx,value,x,y,maxWidth,lineHeight,maxLines=99) {
    let line='',lines=0;
    for(const char of value.match(/[A-Za-z0-9]+|[^A-Za-z0-9]/g)||[]) {
      if(ctx.measureText(line+char).width>maxWidth&&line) {
        if(++lines>=maxLines){ctx.fillText(line.replace(/.$/,'')+'…',x,y);return y+lineHeight;}
        ctx.fillText(line,x,y);y+=lineHeight;line='';
      }
      line+=char;
    }
    if(line)ctx.fillText(line,x,y);return y+lineHeight;
  }
  function makeTexture(index) {
    if(textures.has(index))return textures.get(index);
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1056;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#e7dcc1';ctx.fillRect(0,0,768,1056);
    const cover=index===0||index===count-1;
    if(cover) {
      ctx.fillStyle='#18221b';ctx.fillRect(0,0,768,1056);
      ctx.strokeStyle='#9f834c';ctx.lineWidth=3;ctx.strokeRect(32,32,704,992);ctx.lineWidth=1;ctx.strokeRect(44,44,680,968);
      ctx.textAlign='center';ctx.fillStyle='#b9a274';ctx.font='23px sans-serif';ctx.fillText('杨锟  /  Killian Yang',384,157);
      ctx.font='64px "Songti SC",serif';ctx.fillText(index===0?'作品之书':'未完，待续',384,570);
      ctx.font='25px sans-serif';ctx.fillText('从 AI 创意，到产品落地。',384,640);
      ctx.fillStyle='#baa06b';ctx.fillRect(381,280,6,180);ctx.fillRect(342,320,84,7);ctx.beginPath();ctx.moveTo(381,460);ctx.lineTo(387,460);ctx.lineTo(384,479);ctx.fill();
      ctx.font='20px sans-serif';ctx.fillText('AI Product Builder',384,920);
    } else {
      const ch=chapters[Math.floor((index-1)/2)],face=index%2===1;
      ctx.strokeStyle='#a9936450';ctx.lineWidth=1;ctx.strokeRect(22,22,724,1012);
      ctx.fillStyle='#837454';ctx.font='18px sans-serif';ctx.fillText(face?'杨锟 / 作品集':ch.title,62,78);
      ctx.beginPath();ctx.moveTo(62,110);ctx.lineTo(706,110);ctx.stroke();
      ctx.fillText(String(index).padStart(2,'0'),face?62:675,1004);
      if(face) {
        ctx.textAlign='center';ctx.fillStyle='#86734e';ctx.font='20px sans-serif';wrap(ctx,ch.label,384,510,620,32,2);
        ctx.fillStyle='#2d3025';ctx.font='64px "Cormorant Garamond","Songti SC",Georgia,serif';
        const titleEnd=wrap(ctx,ch.title,384,598,615,76,3);
        ctx.fillStyle='#807154';ctx.font='20px sans-serif';wrap(ctx,ch.notes.replace(/(Launched|Built with|Role)/g,' $1 · '),384,titleEnd+35,610,34,3);
        ctx.font='22px sans-serif';ctx.fillStyle='#745a2e';ctx.fillText('完整项目与细节  ↗',384,930);
        const img=new Image();img.onload=()=>{
          const s=Math.min(250/img.naturalWidth,250/img.naturalHeight),w=img.naturalWidth*s,h=img.naturalHeight*s;
          ctx.drawImage(img,384-w/2,300-h/2,w,h);texture.needsUpdate=true;requestDraw();
        };img.src=ch.icon.getAttribute('src');
      } else {
        ctx.fillStyle='#3c382c';ctx.font='40px "Songti SC",serif';ctx.fillText('关于这个作品',62,195);
        ctx.font='31px sans-serif';ctx.fillStyle='#3d392d';
        const end=wrap(ctx,ch.intro,62,269,642,51,10);
        ctx.fillStyle='#7b6948';ctx.font='21px sans-serif';
        const first=ch.article.querySelector('.project-copy-stack p')?.textContent.trim()||'';
        if(end<740)wrap(ctx,first,62,end+32,642,36,Math.floor((805-end)/36));
        ctx.font='23px sans-serif';ctx.fillStyle='#745a2e';ctx.fillText('展开完整介绍与产品入口  ↗',62,930);
      }
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    textures.set(index,texture);return texture;
  }
  function staticPages(page=current) {
    const closed=page===0||page===count-1;
    const start=page===0?0:page%2===0?page-1:page;
    left.visible=leftBase.visible=leftStack.visible=!portrait&&!closed;
    right.visible=true;rightBase.visible=rightStack.visible=true;
    edges.visible=!closed;spine.visible=!closed;
    if(!portrait&&!closed){mats[0].map=makeTexture(start);mats[0].needsUpdate=true;}
    mats[1].map=makeTexture(closed?page:portrait?page:Math.min(count-1,start+1));mats[1].needsUpdate=true;
    const held=new Set([start,start+1,page,animation?.frontIndex,animation?.backIndex]);
    for(const [i,t] of textures)if(textures.size>8&&!held.has(i)){t.dispose();textures.delete(i);}
  }
  function bend(p) {
    frameCamera(Math.sin(Math.PI*p));
    for(let row=0;row<=12;row++) {
      const strip=sheetStrip(p,W,36,row/12);
      for(let col=0;col<=36;col++) {
        const i=row*37+col,pt=strip[col];
        geom.attributes.position.setXYZ(i,pt.x,H/2-row*H/12,.016+pt.z);
        backGeom.attributes.position.setXYZ(i,pt.x,H/2-row*H/12,.016+pt.z);
      }
    }
    for(const g of [geom,backGeom]){g.attributes.position.needsUpdate=true;g.computeVertexNormals();}
  }
  function finish() {
    current=animation.target;animation=null;front.visible=back.visible=false;
    frameCamera();staticPages();onPage(current);draw();
  }
  function frame(time) {
    raf=0;if(!animation)return;
    if(animation.dragging){draw();return;}
    const t=Math.min(1,(time-animation.started)/(animation.duration||1000)),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const from=animation.from??(animation.reverse?1:0),to=animation.to??(animation.reverse?0:1);
    animation.progress=from+(to-from)*e;bend(animation.progress);draw();
    if(t===1)finish();else raf=requestAnimationFrame(frame);
  }
  function turn(target,animate=true) {
    target=Math.max(0,Math.min(count-1,target));if(target===current)return;
    if(animation){if(raf)cancelAnimationFrame(raf);raf=0;animation=null;front.visible=back.visible=false;}
    if(!animate||reduced.matches||target===0||target===count-1){current=target;frameCamera();staticPages();onPage(current);draw();return;}
    const reverse=target<current;
    const fromStart=current%2===0?current-1:current,toStart=target%2===0?target-1:target;
    const frontIndex=portrait?(reverse?target:current):reverse?toStart+1:fromStart+1;
    const backIndex=portrait?(reverse?current:target):reverse?fromStart:toStart;
    animation={target,reverse,frontIndex,backIndex,started:performance.now()};
    if(portrait){mats[1].map=makeTexture(target);mats[1].needsUpdate=true;}
    else if(reverse){mats[0].map=makeTexture(toStart);mats[0].needsUpdate=true;}
    else {mats[1].map=makeTexture(Math.min(count-1,toStart+1));mats[1].needsUpdate=true;}
    frontMat.map=makeTexture(Math.max(0,frontIndex));backMat.map=makeTexture(Math.max(0,backIndex));frontMat.needsUpdate=backMat.needsUpdate=true;
    front.visible=back.visible=true;bend(reverse?1:0);raf=requestAnimationFrame(frame);
  }
  function next(animate){turn(adjacentPage(current,count,portrait,1),animate);}
  function prev(animate){turn(adjacentPage(current,count,portrait,-1),animate);}
  function frameCamera(lift=0) {
    const center=portrait?W/2:0;
    camera.position.set(center+.12,portrait?-1.8:-2.4,(portrait?6.1:6.4)+lift*3.1);
    camera.lookAt(center,.02,lift*.35);camera.updateProjectionMatrix();
  }
  function resize() {
    const width=host.clientWidth;portrait=width<620;
    const height=Math.max(390,Math.min(520,width*(portrait?1.35:.66)));
    renderer.setSize(width,height,false);camera.aspect=width/height;
    frameCamera();
    book.rotation.z=portrait?-.015:-.045;staticPages();draw();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{if(animation)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(drag){
      if(reduced.matches)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!animation&&Math.abs(dx)>9&&Math.abs(dx)>Math.abs(dy)){
        drag.reverse=dx>0;drag.reverse?prev(true):next(true);
        if(animation){animation.dragging=true;drag.active=true;}
      }
      if(drag.active&&animation){
        const fraction=Math.max(0,Math.min(1,(drag.reverse?dx:-dx)/(canvas.clientWidth*.55)));
        animation.progress=drag.reverse?1-fraction:fraction;bend(animation.progress);requestDraw();
      }
      return;
    }
    if(!reduced.matches&&e.pointerType==='mouse') {
      const r=canvas.getBoundingClientRect();targetRotation.x=(e.clientY-r.top-r.height/2)/r.height*.025;targetRotation.y=(e.clientX-r.left-r.width/2)/r.width*.025;
      book.rotation.x=targetRotation.x;book.rotation.y=targetRotation.y;requestDraw();
    }
  });
  canvas.addEventListener('pointerleave',()=>{if(!drag){book.rotation.x=book.rotation.y=0;requestDraw();}});
  canvas.addEventListener('pointerup',e=>{
    if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(drag.active&&animation){
      const fraction=drag.reverse?1-animation.progress:animation.progress;
      animation.from=animation.progress;animation.to=fraction>.18?(drag.reverse?0:1):(drag.reverse?1:0);
      if(fraction<=.18)animation.target=current;
      animation.dragging=false;animation.duration=550;animation.started=performance.now();drag=null;
      if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);return;
    }
    drag=null;
    if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){dx<0?next(true):prev(true);return;}
    const r=canvas.getBoundingClientRect();
    if(e.clientY-r.top>r.height*.7&&e.clientY-r.top<r.height*.87&&current>0&&current<count-1) readChapter(Math.max(0,Math.floor((current-1)/2)),canvas);
  });
  canvas.addEventListener('pointercancel',()=>{
    if(animation?.dragging){animation.target=current;animation.from=animation.progress;animation.to=animation.reverse?1:0;animation.dragging=false;animation.started=performance.now();animation.duration=350;if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
    drag=null;
  });
  canvas.addEventListener('webglcontextlost',()=>{host.classList.remove('epic-3d-active');});
  resize();
  return {
    getCurrentPageIndex:()=>current,getOrientation:()=>portrait?'portrait':'landscape',
    turnToPage:p=>turn(p,false),flip:p=>turn(p,true),
    flipNext:()=>next(true),flipPrev:()=>prev(true),turnToNextPage:()=>next(false),turnToPrevPage:()=>prev(false),update:resize,
    dispose(){disposed=true;observer.disconnect();if(raf)cancelAnimationFrame(raf);renderer.dispose();textures.forEach(t=>t.dispose());}
  };
}
