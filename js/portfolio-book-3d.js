import * as THREE from './vendor/three.module.min.js';
import { sheetStrip } from './book-surface.mjs?v=4';
import { paintBookPage, createCrispPage } from './book-page-art.js?v=5';
import { pageMatrix } from './book-projection.mjs';
import { dragBookView, bookGesture } from './book-view-state.mjs?v=2';
import { adjacentPage } from './portfolio-book-state.mjs?v=2';

// Real geometry, lighting and two independently typeset paper faces.
export async function createBookScene(host, chapters, {initialPage=1,onPage,readChapter}) {
  const W=2.65,H=3.65, count=chapters.length*2+2;
  await document.fonts.load('40px "Songti SC"');
  host.tabIndex=0;host.setAttribute('role','group');host.setAttribute('aria-label','作品之书，方向键翻页');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.className='epic-webgl';renderer.domElement.setAttribute('aria-label','立体作品册，拖动纸页左右翻阅');
  renderer.domElement.setAttribute('role','img');host.append(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(35,1,.1,50), book=new THREE.Group(),pivot=new THREE.Group();
  pivot.add(book);scene.add(pivot,new THREE.HemisphereLight(0xf4f7ff,0x30362b,1.5));
  const lamp=new THREE.DirectionalLight(0xfff5e5,2.3);lamp.position.set(-3,1,7);lamp.castShadow=true;
  lamp.shadow.mapSize.set(2048,2048);lamp.shadow.camera.left=-4;lamp.shadow.camera.right=4;lamp.shadow.camera.top=4;lamp.shadow.camera.bottom=-4;lamp.shadow.normalBias=.015;lamp.shadow.bias=-.0003;lamp.shadow.radius=4;scene.add(lamp);
  const fill=new THREE.DirectionalLight(0xbad5f0,.7);fill.position.set(4,-2,4);scene.add(fill);
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=256;
  const grainContext=grainCanvas.getContext('2d'),grainData=grainContext.createImageData(256,256);
  let seed=173;
  for(let i=0;i<grainData.data.length;i+=4) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const value=100+(seed>>>27)*2;
    grainData.data.set([value,value,value,255],i);
  }
  grainContext.putImageData(grainData,0,0);
  const grain=new THREE.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(5,5);
  const leather=new THREE.MeshStandardMaterial({color:0x26211b,roughness:.82,metalness:.07,bumpMap:grain,bumpScale:.012});
  const brass=new THREE.MeshStandardMaterial({color:0x887249,roughness:.55,metalness:.65});
  const paper=new THREE.MeshStandardMaterial({color:0xbeb49b,roughness:1});
  function box(w,h,d,x,z,mat) {
    let geometry;
    if(mat===leather&&w>1) {
      const r=.065,s=new THREE.Shape();
      s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
      s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      geometry=new THREE.ExtrudeGeometry(s,{depth:d-.024,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:3,steps:1});
      geometry.translate(0,0,-d/2+.012);
    } else geometry=new THREE.BoxGeometry(w,h,d);
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,0,z);m.castShadow=true;m.receiveShadow=true;book.add(m);return m;
  }
  const leftBase=box(W+.12,H+.14,.075,-W/2,-.185,leather);
  const rightBase=box(W+.12,H+.14,.075,W/2,-.185,leather);
  const leftStack=box(W-.03,H-.035,.145,-W/2,-.075,paper);
  const rightStack=box(W-.03,H-.035,.145,W/2,-.075,paper);
  const spine=box(.12,H+.1,.2,0,-.1,leather);
  const frontBoard=box(W+.12,H+.14,.07,W/2,.19,leather);frontBoard.visible=false;
  const bindingMaterial=new THREE.MeshStandardMaterial({color:0x30251c,roughness:.85,bumpMap:grain,bumpScale:.015});
  const backBindings=[-1,1].map(side=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),bindingMaterial);m.position.set(side*W/2,0,-.23);m.rotation.y=Math.PI;book.add(m);return m;
  });
  let bindingMap=null;
  const coverCorners=new THREE.Group();book.add(coverCorners);
  for(const x of [.03,W-.03])for(const y of [-H/2,H/2]) {
    for(const [w,h] of [[.24,.055],[.055,.24]]) {
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.025),brass);
      m.position.set(x+(w>.1?(x<W/2?.09:-.09):0),y+(h>.1?(y<0?.09:-.09):0),.245);
      m.castShadow=true;coverCorners.add(m);
    }
  }
  for(const y of [-1.2,-.65,.65,1.2]) {
    const rib=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,H*.035,12),leather);
    rib.rotation.z=Math.PI/2;rib.position.set(.02,y,.19);coverCorners.add(rib);
  }
  // Fine physical page edges and metal corners, not a flat shadow illustration.
  const edges=new THREE.Group();book.add(edges);
  for(const side of [-1,1]) {
    for(let i=0;i<8;i++) {
      const edge=new THREE.Mesh(new THREE.BoxGeometry(W,.009,.003),new THREE.MeshStandardMaterial({color:i%2?0xb1a487:0xd8ccb1,roughness:1}));
      edge.position.set(side*W/2,-H/2-.002,-.14+i*.017);edge.userData.side=side;edges.add(edge);
    }
    for(const y of [-1,1]) {
      const metal=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.018),brass);
      metal.position.set(side*(W-.06),y*(H/2-.03),-.13);metal.userData.side=side;edges.add(metal);
    }
  }
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.ShadowMaterial({color:0x000000,opacity:.6}));
  shadow.position.z=-.249;shadow.receiveShadow=true;scene.add(shadow);
  const mats=[0,1].map(()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.98,bumpMap:grain,bumpScale:.004}));
  function restingPaper() {
    const g=new THREE.PlaneGeometry(W,H,36,12),p=g.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,.025*Math.sin(Math.PI*(p.getX(i)/W+.5)));
    g.computeVertexNormals();return g;
  }
  const left=new THREE.Mesh(restingPaper(),mats[0]);left.position.set(-W/2,0,.006);left.receiveShadow=true;book.add(left);
  const right=new THREE.Mesh(restingPaper(),mats[1]);right.position.set(W/2,0,.009);right.receiveShadow=true;book.add(right);
  const leftWing=new THREE.Group();book.add(leftWing);
  [leftBase,leftStack,left,backBindings[0],...edges.children.filter(m=>m.userData.side===-1)].forEach(m=>leftWing.add(m));
  const leftGuards=coverCorners.clone();leftGuards.rotation.y=Math.PI;leftWing.add(leftGuards);
  const coverOutside=new THREE.MeshStandardMaterial({roughness:.85,bumpMap:grain,bumpScale:.015});backBindings[0].material=coverOutside;
  const geom=new THREE.PlaneGeometry(W,H,36,12);geom.translate(W/2,0,0);
  const backGeom=geom.clone(), uv=backGeom.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
  const frontMat=new THREE.MeshStandardMaterial({side:THREE.FrontSide,roughness:.94});
  const backMat=new THREE.MeshStandardMaterial({side:THREE.BackSide,roughness:.94});
  const front=new THREE.Mesh(geom,frontMat),back=new THREE.Mesh(backGeom,backMat);
  for(const m of [front,back]){m.castShadow=true;m.receiveShadow=true;m.visible=false;m.frustumCulled=false;book.add(m);}
  let current=initialPage, animation=null, raf=0, portrait=false, drag=null, disposed=false,queuedTarget=null;
  const textures=new Map();
  let view={yaw:0,pitch:0,x:0,y:0},viewMode='read';
  const crisp=document.createElement('div');crisp.className='epic-crisp-layer';host.append(crisp);
  const crispSlots=[null,null];
  function draw(){if(!disposed){renderer.render(scene,camera);positionCrispPages();}}
  function positionCrispPages() {
    crisp.hidden=!!animation;
    if(animation)return;
    if(current===0||current===count-1){crisp.hidden=true;return;}
    book.updateMatrixWorld(true);
    for(const [slot,mesh] of [left,right].entries()) {
      const index=mesh.material.map?.userData.pageIndex;
      const normal=new THREE.Vector3(0,0,1).transformDirection(mesh.matrixWorld);
      const towardCamera=camera.position.clone().sub(mesh.getWorldPosition(new THREE.Vector3())).normalize();
      if(!mesh.visible||index===undefined||normal.dot(towardCamera)<.08){if(crispSlots[slot])crispSlots[slot].hidden=true;continue;}
      let el=crispSlots[slot];
      if(!el||el.dataset.page!==String(index)) {
        const next=createCrispPage(index,count,chapters);next.dataset.page=index;
        if(el)el.replaceWith(next);else crisp.append(next);el=crispSlots[slot]=next;
      }
      el.hidden=false;
      el.querySelectorAll('.crisp-page-edge').forEach(edge=>{
        edge.hidden=!portrait&&(slot===0?edge.classList.contains('next'):edge.classList.contains('prev'));
      });
      const points=[[-W/2,H/2],[W/2,H/2],[W/2,-H/2],[-W/2,-H/2]].map(([x,y])=>{
        const p=new THREE.Vector3(x,y,.04);mesh.localToWorld(p);p.project(camera);
        return {x:(p.x+1)*renderer.domElement.clientWidth/2,y:(1-p.y)*renderer.domElement.clientHeight/2};
      });
      el.style.transform='matrix3d('+pageMatrix(points).join(',')+')';
    }
  }
  crisp.addEventListener('click',e=>{
    const action=e.target.closest('[data-surface-action]')?.dataset.surfaceAction;
    if(action==='next')next(true);
    if(action==='prev')prev(true);
    if(action==='open')turn(1,true);
    if(action==='read')readChapter(Math.max(0,Math.floor((current-1)/2)),e.target);
  });
  function requestDraw(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw();});}
  const images=new Map();
  function loadImage(src) {
    if(!src)return null;
    if(images.has(src))return images.get(src).complete&&images.get(src).naturalWidth?images.get(src):null;
    const img=new Image();images.set(src,img);
    img.onload=()=>{
      if(disposed)return;
      if(src.includes('leather-binding')) {
        bindingMap=new THREE.Texture(img);bindingMap.colorSpace=THREE.SRGBColorSpace;bindingMap.needsUpdate=true;
        bindingMaterial.map=bindingMap;bindingMaterial.color.set(0xffffff);bindingMaterial.needsUpdate=true;
      }
      for(const [index,texture] of textures) {
        paintBookPage(texture.image.getContext('2d'),index,count,chapters,loadImage);
        texture.needsUpdate=true;
      }
      requestDraw();
    };
    img.src=src;return null;
  }
  function makeTexture(index) {
    if(textures.has(index))return textures.get(index);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1408;
    paintBookPage(canvas.getContext('2d'),index,count,chapters,loadImage);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    texture.userData.pageIndex=index;
    textures.set(index,texture);return texture;
  }
  function staticPages(page=current) {
    const closed=page===0||page===count-1;
    tools.querySelector('[data-view="cover"]').textContent=closed?'打开':'合书';
    const start=page===0?0:page%2===0?page-1:page;
    left.visible=leftBase.visible=leftStack.visible=!portrait&&!closed;
    right.visible=true;rightBase.visible=rightStack.visible=true;
    edges.visible=!closed;spine.visible=!closed;
    frontBoard.visible=coverCorners.visible=closed;right.position.z=closed?.235:.009;
    leftWing.visible=!portrait&&!closed;leftWing.rotation.y=0;
    rightStack.scale.z=closed?2:1;rightStack.position.z=closed?0:-.075;
    coverOutside.map=makeTexture(0);coverOutside.needsUpdate=true;
    backBindings[0].visible=!portrait&&!closed;
    mats[1].bumpMap=grain;mats[1].bumpScale=closed?.025:.004;mats[1].roughness=closed?.8:.98;
    const center=portrait||closed?W/2:0;book.position.x=-center;pivot.position.set(center+view.x,view.y,0);
    edges.children.forEach(m=>{m.visible=!portrait||m.userData.side===1;});
    if(!closed){mats[0].map=makeTexture(start);mats[0].needsUpdate=true;}
    mats[1].map=makeTexture(closed?page:portrait?page:Math.min(count-1,start+1));mats[1].needsUpdate=true;
    const held=new Set([0,start,start+1,page,animation?.frontIndex,animation?.backIndex]);
    for(const [i,t] of textures)if(textures.size>8&&!held.has(i)){t.dispose();textures.delete(i);}
  }
  function bend(p) {
    for(let row=0;row<=12;row++) {
      const strip=sheetStrip(p,W,36,row/12);
      for(let col=0;col<=36;col++) {
        const i=row*37+col,pt=strip[col];
        geom.attributes.position.setXYZ(i,pt.x,H/2-row*H/12,.04+pt.z);
        backGeom.attributes.position.setXYZ(i,pt.x,H/2-row*H/12,.04+pt.z);
      }
    }
    for(const g of [geom,backGeom]){g.attributes.position.needsUpdate=true;g.computeVertexNormals();}
  }
  function coverPose(p) {
    leftWing.visible=true;leftWing.rotation.y=Math.PI*p;
    left.visible=leftBase.visible=leftStack.visible=backBindings[0].visible=true;
    frontBoard.visible=coverCorners.visible=false;
    const compressed=THREE.MathUtils.smoothstep(p,.84,1);
    rightStack.scale.z=1+compressed;rightStack.position.z=-.075*(1-compressed);
    const q=(p-animation.initial)/(animation.final-animation.initial);
    view=Object.fromEntries(Object.entries(animation.startView).map(([k,v])=>[k,v*(1-q)]));
    const center=portrait?W/2:p*W/2;book.position.x=-center;
    pivot.position.set(center+view.x,view.y,0);pivot.rotation.set(view.pitch,view.yaw,0);
    frameCamera(p);
  }
  function animationPose(p) {if(animation.kind==='cover')coverPose(p);else bend(p);}
  function finish() {
    current=animation.target;animation=null;front.visible=back.visible=false;
    frameCamera();staticPages();onPage(current);draw();
    if(queuedTarget!==null){const target=queuedTarget;queuedTarget=null;turn(target,true);}
  }
  function frame(time) {
    raf=0;if(!animation)return;
    if(animation.dragging){draw();return;}
    const t=Math.min(1,(time-animation.started)/(animation.duration||1000)),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const from=animation.from??(animation.reverse?1:0),to=animation.to??(animation.reverse?0:1);
    animation.progress=from+(to-from)*e;animationPose(animation.progress);draw();
    if(t===1)finish();else raf=requestAnimationFrame(frame);
  }
  function turn(target,animate=true) {
    target=Math.max(0,Math.min(count-1,target));
    if(animation&&animate){queuedTarget=target;return;}
    if(target===current)return;
    if(animation){if(raf)cancelAnimationFrame(raf);raf=0;animation=null;queuedTarget=null;front.visible=back.visible=false;}
    const focused=document.activeElement;
    if(crisp.contains(focused)&&focused.matches(':focus-visible'))host.focus({preventScroll:true});
    if(!animate||reduced.matches){current=target;frameCamera();staticPages();onPage(current);draw();return;}
    const sourceClosed=current===0||current===count-1,targetClosed=target===0||target===count-1;
    if(sourceClosed&&targetClosed){current=target;frameCamera();staticPages();onPage(current);draw();return;}
    if(sourceClosed||targetClosed) {
      if(sourceClosed)staticPages(target);
      else staticPages(current);
      animation={kind:'cover',target,initial:sourceClosed?1:0,final:targetClosed?1:0,from:sourceClosed?1:0,to:targetClosed?1:0,startView:{...view},started:performance.now(),duration:1150};
      coverPose(animation.initial);draw();raf=requestAnimationFrame(frame);return;
    }
    const reverse=target<current;
    const fromStart=current%2===0?current-1:current,toStart=target%2===0?target-1:target;
    const frontIndex=portrait?(reverse?target:current):reverse?toStart+1:fromStart+1;
    const backIndex=portrait?(reverse?current:target):reverse?fromStart:toStart;
    animation={kind:'paper',target,reverse,frontIndex,backIndex,from:reverse?1:0,to:reverse?0:1,started:performance.now(),duration:880};
    if(portrait){mats[1].map=makeTexture(target);mats[1].needsUpdate=true;}
    else if(reverse){mats[0].map=makeTexture(toStart);mats[0].needsUpdate=true;}
    else {mats[1].map=makeTexture(Math.min(count-1,toStart+1));mats[1].needsUpdate=true;}
    frontMat.map=makeTexture(Math.max(0,frontIndex));backMat.map=makeTexture(Math.max(0,backIndex));frontMat.needsUpdate=backMat.needsUpdate=true;
    front.visible=back.visible=true;bend(reverse?1:0);raf=requestAnimationFrame(frame);
  }
  function next(animate){turn(adjacentPage(current,count,portrait,1),animate);}
  function prev(animate){turn(adjacentPage(current,count,portrait,-1),animate);}
  function frameCamera(closedness=null) {
    const closed=closedness??(current===0||current===count-1?1:0),center=portrait?W/2:closed*W/2;
    camera.fov=15;
    const halfAngle=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const distance=Math.max((portrait?2.95:5.65-closed*2.7)/(2*halfAngle*camera.aspect),4.4/(2*halfAngle));
    camera.position.set(center+.1,-distance*.18,distance);
    camera.lookAt(center,.18,.25);camera.updateProjectionMatrix();
  }
  function resize() {
    const width=host.clientWidth;if(width<1)return;portrait=width<620;
    const height=portrait?Math.max(440,Math.min(650,width*1.6)):Math.max(490,Math.min(740,width*.82));
    renderer.setSize(width,height,false);camera.aspect=width/height;
    frameCamera();
    book.rotation.z=portrait?-.015:-.045;staticPages();if(animation)animationPose(animation.progress??animation.from);draw();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  const canvas=renderer.domElement;
  const tools=document.createElement('div');tools.className='epic-model-tools';
  tools.innerHTML='<span class="epic-model-hint">拖动纸页翻阅 · 书外旋转</span><div><button type="button" data-view="read" aria-pressed="true">翻页</button><button type="button" data-view="rotate" aria-pressed="false">旋转</button><button type="button" data-view="pan" aria-pressed="false">移动</button><button type="button" data-view="cover">合书</button><button type="button" data-view="reset">复位</button></div>';
  host.before(tools);
  function applyView() {
    pivot.rotation.set(view.pitch,view.yaw,0);
    const center=portrait||current===0||current===count-1?W/2:0;
    pivot.position.set(center+view.x,view.y,0);
    host.dataset.bookYaw=view.yaw.toFixed(3);host.dataset.bookPitch=view.pitch.toFixed(3);
    requestDraw();
  }
  tools.addEventListener('click',e=>{
    const mode=e.target.closest('[data-view]')?.dataset.view;if(!mode)return;
    if(mode==='reset'||mode==='cover') {
      if(mode==='cover')turn(current===0||current===count-1?1:0,true);
      else {view={yaw:0,pitch:0,x:0,y:0};applyView();}
    } else {
      viewMode=mode;tools.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===mode)));
      tools.querySelector('.epic-model-hint').textContent=mode==='read'?'拖动纸页翻阅 · 书外旋转':mode==='pan'?'拖动移动 · 页边翻页':'拖动旋转 · 页边翻页';
    }
  });
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  const raycaster=new THREE.Raycaster();
  canvas.addEventListener('pointerdown',e=>{
    if(animation)return;
    const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);
    const onPaper=raycaster.intersectObjects([left,right].filter(m=>m.visible)).length>0;
    drag={x:e.clientX,y:e.clientY,start:{...view},mode:bookGesture(onPaper,current===0||current===count-1,viewMode,e.shiftKey||e.button===2)};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(drag){
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      drag.dx=dx;drag.dy=dy;
      if(drag.mode==='page') {
        if(reduced.matches)return;
        if(!animation&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)*.6) {
          dx<0?next(true):prev(true);
          if(animation){animation.dragging=true;drag.active=true;drag.direction=Math.sign(dx);drag.from=animation.from;drag.to=animation.to;if(raf)cancelAnimationFrame(raf);raf=0;}
        }
        if(drag.active&&animation) {
          drag.fraction=Math.max(0,Math.min(1,dx*drag.direction/(canvas.clientWidth*(portrait?.7:.45))));
          animation.progress=drag.from+(drag.to-drag.from)*drag.fraction;animationPose(animation.progress);requestDraw();
        }
      } else {view=dragBookView(drag.start,dx,dy,canvas.clientWidth,canvas.clientHeight,drag.mode);applyView();}
      return;
    }
  });
  function releaseDrag(cancel=false) {
    if(drag?.active&&animation) {
      const commit=!cancel&&drag.fraction>.22;
      animation.from=animation.progress;animation.to=commit?drag.to:drag.from;if(!commit)animation.target=current;
      animation.dragging=false;animation.started=performance.now();animation.duration=420;
      if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
    } else if(!cancel&&drag?.mode==='page'&&reduced.matches&&Math.abs(drag.dx||0)>35&&Math.abs(drag.dx)>Math.abs(drag.dy||0)*.6) {
      drag.dx<0?next(false):prev(false);
    } else if(!cancel&&drag&&viewMode==='read'&&(current===0||current===count-1)&&Math.hypot(drag.dx||0,drag.dy||0)<6) {
      turn(1,true);
    }
    drag=null;
  }
  canvas.addEventListener('pointerup',()=>releaseDrag());
  canvas.addEventListener('pointercancel',()=>releaseDrag(true));
  canvas.addEventListener('webglcontextlost',()=>{host.classList.remove('epic-3d-active');});
  resize();
  return {
    getCurrentPageIndex:()=>current,getOrientation:()=>portrait?'portrait':'landscape',
    turnToPage:p=>turn(p,false),flip:p=>turn(p,true),
    flipNext:()=>next(true),flipPrev:()=>prev(true),turnToNextPage:()=>next(false),turnToPrevPage:()=>prev(false),update:resize,
    dispose(){
      disposed=true;observer.disconnect();if(raf)cancelAnimationFrame(raf);
      textures.forEach(t=>t.dispose());grain.dispose();bindingMap?.dispose();crisp.remove();tools.remove();
      const geometries=new Set(),materials=new Set();
      scene.traverse(m=>{if(m.geometry)geometries.add(m.geometry);if(m.material)materials.add(m.material);});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
    }
  };
}
