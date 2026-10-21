import * as THREE from './vendor/three.module.min.js';
import { sheetStrip } from './book-surface.mjs?v=3';
import { paintBookPage } from './book-page-art.js?v=1';
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
  const leather=new THREE.MeshStandardMaterial({color:0x263129,roughness:.82,metalness:.07,bumpMap:grain,bumpScale:.012});
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
      edge.position.set(side*W/2,-H/2-.002,-.14+i*.017);edge.userData.side=side;edges.add(edge);
    }
    for(const y of [-1,1]) {
      const metal=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.018),brass);
      metal.position.set(side*(W-.06),y*(H/2-.03),-.13);metal.userData.side=side;edges.add(metal);
    }
  }
  const table=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.MeshStandardMaterial({color:0x293029,roughness:.96,bumpMap:grain,bumpScale:.016}));
  table.position.z=-.25;scene.add(table);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.ShadowMaterial({color:0x000000,opacity:.6}));
  shadow.position.z=-.249;shadow.receiveShadow=true;scene.add(shadow);
  const mats=[0,1].map(()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94}));
  function restingPaper() {
    const g=new THREE.PlaneGeometry(W,H,36,12),p=g.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,.025*Math.sin(Math.PI*(p.getX(i)/W+.5)));
    g.computeVertexNormals();return g;
  }
  const left=new THREE.Mesh(restingPaper(),mats[0]);left.position.set(-W/2,0,.006);left.receiveShadow=true;book.add(left);
  const right=new THREE.Mesh(restingPaper(),mats[1]);right.position.set(W/2,0,.009);right.receiveShadow=true;book.add(right);
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
  const images=new Map();
  function loadImage(src) {
    if(!src)return null;
    if(images.has(src))return images.get(src).complete&&images.get(src).naturalWidth?images.get(src):null;
    const img=new Image();images.set(src,img);
    img.onload=()=>{
      if(disposed)return;
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
    textures.set(index,texture);return texture;
  }
  function staticPages(page=current) {
    const closed=page===0||page===count-1;
    const start=page===0?0:page%2===0?page-1:page;
    left.visible=leftBase.visible=leftStack.visible=!portrait&&!closed;
    right.visible=true;rightBase.visible=rightStack.visible=true;
    edges.visible=!closed;spine.visible=!closed;
    edges.children.forEach(m=>{m.visible=!portrait||m.userData.side===1;});
    if(!portrait&&!closed){mats[0].map=makeTexture(start);mats[0].needsUpdate=true;}
    mats[1].map=makeTexture(closed?page:portrait?page:Math.min(count-1,start+1));mats[1].needsUpdate=true;
    const held=new Set([start,start+1,page,animation?.frontIndex,animation?.backIndex]);
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
  function frameCamera() {
    const center=portrait?W/2:0;
    // A longer lens on narrow screens keeps the raised sheet inside the frame
    // without a conspicuous mid-turn zoom-out.
    camera.fov=portrait?15:35;
    camera.position.set(center+.12,portrait?-3:-2.7,portrait?18:7.9);
    camera.lookAt(center,portrait?.22:.02,.42);camera.updateProjectionMatrix();
  }
  function resize() {
    const width=host.clientWidth;portrait=width<620;
    const height=portrait?Math.max(440,Math.min(600,width*1.6)):Math.max(390,Math.min(580,width*.66));
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
    dispose(){
      disposed=true;observer.disconnect();if(raf)cancelAnimationFrame(raf);
      textures.forEach(t=>t.dispose());grain.dispose();
      const geometries=new Set(),materials=new Set();
      scene.traverse(m=>{if(m.geometry)geometries.add(m.geometry);if(m.material)materials.add(m.material);});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
    }
  };
}
