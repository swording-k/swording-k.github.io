// Canvas is only the ink on the physical paper, never a substitute for geometry.
const PW=768, PH=1056;
const serif='"Songti SC", "Noto Serif CJK SC", Georgia, serif';
const sans=serif;
const bookNotes=value=>value.replace(/Launched/g,'发布：').replace(/Built with/g,' · 技术：').replace(/Role/g,' · 负责：');
const visuals=[
  [/fit\s?genius/i,'images/book/fitgenius-promo.webp','产品界面'],
  [/atoll/i,'images/book/atoll-stats.webp','产品界面','images/book/atoll-media.webp'],
  [/workisland/i,'images/book/workisland-approval.webp','产品界面示例'],
  [/theme/i,'images/book/theme-studio.webp','主题工作台'],
  [/最后的书店/,'images/last-bookstore-poster.png','作品海报'],
  [/pet/i,'images/codex-pet-collection-preview.png','角色动作预览']
];
export function preloadBookImages(chapters,load) {
  const sources=new Set(['images/book/laid-paper-v1.webp','images/book/leather-binding-v1.webp']);
  for(const ch of chapters) {
    sources.add(ch.icon.getAttribute('src'));
    const spec=visuals.find(v=>v[0].test(ch.title));
    if(spec){sources.add(spec[1]);if(spec[3])sources.add(spec[3]);}
  }
  sources.forEach(src=>{if(src)load(src);});
}
function text(ctx,value,x,y,width,size=24,lineHeight=38,maxLines=8) {
  ctx.font=`${size}px ${sans}`;
  let line='',n=0;
  for(const char of (value||'').match(/[A-Za-z0-9]+|[^A-Za-z0-9]/g)||[]) {
    if(ctx.measureText(line+char).width>width&&line) {
      if(++n>=maxLines){ctx.fillText(line+'…',x,y);return y+lineHeight;}
      ctx.fillText(line,x,y);line='';y+=lineHeight;
    }
    line+=char;
  }
  if(line)ctx.fillText(line,x,y);return y+lineHeight;
}
function image(ctx,img,x,y,w,h) {
  if(!img)return;
  const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
  const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
  ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
}
function rule(ctx,x,y,w,color) {
  ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
}
export function paintBookPage(ctx,index,count,chapters,load) {
  ctx.save();ctx.scale(ctx.canvas.width/PW,ctx.canvas.height/PH);
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const cover=index===0||index===count-1;
  const face=!cover&&index%2===1;
  ctx.fillStyle=cover?'#1b1916':'#eee5d2';ctx.fillRect(0,0,PW,PH);
  if(!cover){const stock=load('images/book/laid-paper-v1.webp');if(stock)ctx.drawImage(stock,0,0,PW,PH);}
  // Quiet grain belongs to the paper, not a translucent veil over the whole site.
  for(let y=0;y<PH;y+=4){ctx.fillStyle=y%12?'#00000003':'#ffffff05';ctx.fillRect(0,y,PW,1);}
  const gutter=ctx.createLinearGradient(face?PW:0,0,face?PW-58:58,0);
  gutter.addColorStop(0,'#00000035');gutter.addColorStop(1,'#00000000');
  ctx.fillStyle=gutter;ctx.fillRect(face?PW-58:0,0,58,PH);
  if(cover) {
    const binding=load('images/book/leather-binding-v1.webp');
    if(binding)ctx.drawImage(binding,0,0,PW,PH);
    else {
    ctx.fillStyle='#291f18';ctx.fillRect(0,0,PW,PH);
    let seed=723;
    for(let i=0;i<28000;i++) {
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=(seed&1023)/1024*PW;
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=(seed&2047)/2048*PH;
      ctx.fillStyle=i%3?'#08050325':'#c9a67b12';ctx.fillRect(x,y,i%5===0?3:1,1);
    }
    ctx.fillStyle='#17110d';ctx.fillRect(0,0,65,PH);
    for(const y of [150,315,740,905]) {ctx.fillStyle='#38291e';ctx.fillRect(0,y,65,15);ctx.fillStyle='#0d0907';ctx.fillRect(0,y+15,65,4);}
    ctx.strokeStyle='#110c08';ctx.lineWidth=9;ctx.strokeRect(92,55,619,946);
    ctx.strokeStyle='#755a3833';ctx.lineWidth=2;ctx.strokeRect(99,62,605,932);
    ctx.fillStyle='#756344';ctx.fillRect(402,266,5,175);ctx.fillRect(371,304,67,5);
    ctx.beginPath();ctx.moveTo(402,441);ctx.lineTo(407,441);ctx.lineTo(404,458);ctx.fill();
    }
    const center=binding?420:405;
    ctx.textAlign='center';ctx.fillStyle='#a58c61';ctx.font=`66px ${serif}`;
    ctx.shadowColor='#090603';ctx.shadowOffsetY=3;ctx.fillText(index===0?'锻造之书':'未完，待续',center,600);ctx.shadowOffsetY=0;
    ctx.font=`29px ${serif}`;ctx.fillStyle='#a18a65';ctx.fillText('杨锟',center,826);
    ctx.font=`21px ${serif}`;ctx.fillStyle='#786244';ctx.fillText('Killian Yang  ·  2026',center,874);
    ctx.restore();return;
  }
  const ch=chapters[Math.floor((index-1)/2)],spec=visuals.find(v=>v[0].test(ch.title));
  const ink='#353025',muted='#786b52';
  ctx.fillStyle=muted;ctx.font=`25px ${sans}`;
  ctx.fillText(face?'锻造之书 / 杨锟':'项目手记',58,75);
  const productIcon=load(ch.icon.getAttribute('src'));
  image(ctx,productIcon,58,face?130:181,48,48);
  const titleX=ch.icon.getAttribute('src')?124:58;
  if(face) {
    ctx.fillStyle=ink;text(ctx,ch.title,titleX,178,714-titleX,54,66,2);
    ctx.fillStyle=muted;text(ctx,ch.label,54,290,660,25,36,2);
    if(spec) {
      const img=load(spec[1])||productIcon;
      const tall=img&&img.naturalHeight/img.naturalWidth>1.15;
      ctx.fillStyle='#faf4e7';ctx.fillRect(48,338,670,466);
      image(ctx,img,tall?110:60,350,tall?546:646,442);
      const detail=spec[3]&&load(spec[3]);
      if(detail) {
        ctx.fillStyle='#080d0b';ctx.fillRect(64,728,640,111);
        image(ctx,detail,74,733,620,98);
      }
    } else {
      // No invented screenshots for projects without a captured interface.
      image(ctx,load(ch.icon.getAttribute('src')),205,380,358,358);
    }
    const notes=bookNotes(ch.notes);
    ctx.fillStyle=ink;text(ctx,notes,56,874,620,24,34,2);
    ctx.font=`28px ${sans}`;ctx.fillText('完整介绍 ↗',58,972);
  } else {
    ctx.fillStyle=ink;
    text(ctx,ch.title,titleX,229,714-titleX,54,66,2);
    ctx.fillStyle='#353c33';
    text(ctx,ch.intro,58,390,644,40,62,8);
    ctx.fillStyle='#745b32';ctx.font=`28px ${sans}`;ctx.fillText('完整介绍 ↗',58,952);
    let linkX=58+ctx.measureText('完整介绍 ↗').width+32;
    for(const a of ch.links.slice(0,2)) {
      const label=a.textContent.trim();ctx.fillText(label,linkX,952);linkX+=ctx.measureText(label).width+32;
    }
  }
  ctx.fillStyle=muted;ctx.font=`24px ${sans}`;ctx.textAlign='right';ctx.fillText(String(index).padStart(2,'0'),710,1026);
  ctx.restore();
}

export function createCrispPage(index,count,chapters) {
  const el=document.createElement('div');el.className='epic-crisp-page';
  const cover=index===0||index===count-1;
  if(cover) {
    el.classList.add('is-cover');
    el.innerHTML='<p class="crisp-cover-author">杨锟 / Killian Yang</p><div class="crisp-cover-blade"></div><h4></h4><p class="crisp-cover-line">从 AI 创意，到产品落地。</p><button type="button" class="crisp-open" data-surface-action="open">打开作品册</button>';
    el.querySelector('h4').textContent=index===0?'锻造之书':'未完，待续';return el;
  }
  const ch=chapters[Math.floor((index-1)/2)],visual=index%2===1;
  el.classList.toggle('is-visual',visual);
  el.innerHTML='<p class="crisp-running"></p><h4></h4><p class="crisp-kind"></p><div class="crisp-visual"></div><p class="crisp-intro"></p><p class="crisp-notes"></p><div class="crisp-actions"></div><span class="crisp-folio"></span>';
  el.querySelector('.crisp-running').textContent=visual?'锻造之书 / 杨锟':'项目手记';
  el.querySelector('h4').textContent=ch.title;
  el.querySelector('.crisp-kind').textContent=ch.label;
  el.querySelector('.crisp-intro').textContent=ch.intro;
  el.querySelector('.crisp-notes').textContent=bookNotes(ch.notes);
  el.querySelector('.crisp-folio').textContent=String(index).padStart(2,'0');
  const spec=visuals.find(v=>v[0].test(ch.title)),picture=document.createElement('img');
  picture.src=spec?.[1]||ch.icon.getAttribute('src');picture.alt=ch.title;picture.draggable=false;
  if(!spec)picture.className='crisp-icon-only';
  el.querySelector('.crisp-visual').append(picture);
  if(spec?.[3]){const detail=document.createElement('img');detail.src=spec[3];detail.alt='Atoll 媒体控制';detail.className='crisp-image-detail';detail.draggable=false;el.querySelector('.crisp-visual').append(detail);}
  const actions=el.querySelector('.crisp-actions'),read=document.createElement('button');
  read.type='button';read.dataset.surfaceAction='read';read.textContent='完整介绍 ↗';actions.append(read);
  if(!visual)ch.links.slice(0,2).forEach(a=>{const link=a.cloneNode(true);link.removeAttribute('class');link.removeAttribute('style');actions.append(link);});
  for(const direction of ['prev','next']) {
    const edge=document.createElement('button');edge.type='button';edge.className='crisp-page-edge '+direction;
    edge.dataset.surfaceAction=direction;edge.setAttribute('aria-label',direction==='prev'?'翻到上一页':'翻到下一页');
    edge.innerHTML='<span aria-hidden="true">'+(direction==='prev'?'‹':'›')+'</span>';el.append(edge);
  }
  return el;
}
