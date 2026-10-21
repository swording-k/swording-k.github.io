// Canvas is only the ink on the physical paper, never a substitute for geometry.
const PW=768, PH=1056;
const serif='"Songti SC", "Noto Serif CJK SC", Georgia, serif';
const sans='-apple-system, "PingFang SC", sans-serif';
const visuals=[
  [/fit\s?genius/i,'images/book/fitgenius-promo.webp','产品界面'],
  [/atoll/i,'images/book/atoll-stats.webp','产品界面','images/book/atoll-media.webp'],
  [/workisland/i,'images/book/workisland-approval.webp','产品界面示例'],
  [/theme/i,'images/book/theme-studio.webp','主题工作台'],
  [/最后的书店/,'images/last-bookstore-poster.png','作品海报'],
  [/pet/i,'images/codex-pet-collection-preview.png','角色动作预览']
];
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
  const dark=cover||face;
  ctx.fillStyle=dark?'#17211e':'#e8dfcb';ctx.fillRect(0,0,PW,PH);
  // Quiet grain belongs to the paper, not a translucent veil over the whole site.
  for(let y=0;y<PH;y+=4){ctx.fillStyle=y%12?'#00000003':'#ffffff05';ctx.fillRect(0,y,PW,1);}
  const gutter=ctx.createLinearGradient(face?PW:0,0,face?PW-58:58,0);
  gutter.addColorStop(0,'#00000035');gutter.addColorStop(1,'#00000000');
  ctx.fillStyle=gutter;ctx.fillRect(face?PW-58:0,0,58,PH);
  if(cover) {
    ctx.strokeStyle='#a98d57';ctx.lineWidth=2;ctx.strokeRect(38,38,692,980);ctx.lineWidth=.7;ctx.strokeRect(48,48,672,960);
    ctx.textAlign='center';ctx.fillStyle='#b9a274';ctx.font=`20px ${sans}`;ctx.fillText('杨锟  /  Killian Yang',384,147);
    ctx.font=`69px ${serif}`;ctx.fillStyle='#dfd2af';ctx.fillText(index===0?'作品之书':'未完，待续',384,592);
    ctx.font=`24px ${sans}`;ctx.fillStyle='#b9a274';ctx.fillText('从 AI 创意，到产品落地。',384,653);
    ctx.fillStyle='#baa06b';ctx.fillRect(382,286,4,173);ctx.fillRect(347,327,74,5);
    ctx.beginPath();ctx.moveTo(382,459);ctx.lineTo(386,459);ctx.lineTo(384,478);ctx.fill();
    ctx.font=`18px ${sans}`;ctx.fillText('AI PRODUCT BUILDER',384,925);
    ctx.restore();return;
  }
  const ch=chapters[Math.floor((index-1)/2)],spec=visuals.find(v=>v[0].test(ch.title));
  const ink=face?'#d8caab':'#30372f',muted=face?'#a3977d':'#7c7057';
  ctx.fillStyle=muted;ctx.font=`17px ${sans}`;
  ctx.fillText(face?'SELECTED WORKS  /  杨锟':'项目手记  /  '+String(ch.index+1).padStart(2,'0'),54,72);
  rule(ctx,54,96,660,face?'#b9a27455':'#86765366');
  if(face) {
    ctx.fillStyle=ink;ctx.font=`52px ${serif}`;
    // Fit long English titles to two deliberate lines, never shrink the entire spread.
    const title=ch.title;
    if(ctx.measureText(title).width<=650)ctx.fillText(title,54,177);
    else {
      const words=title.split(' ');let a='';
      while(words.length&&ctx.measureText(a+words[0]+' ').width<640)a+=words.shift()+' ';
      ctx.fillText(a.trim()||title.slice(0,12),54,168);
      ctx.fillText(words.join(' ')||title.slice(12),54,226);
    }
    ctx.fillStyle=muted;text(ctx,ch.label,56,276,650,19,30,2);
    if(spec) {
      const img=load(spec[1]);
      const tall=img&&img.naturalHeight/img.naturalWidth>1.15;
      ctx.fillStyle='#0c1311';ctx.fillRect(38,326,690,490);
      image(ctx,img,tall?98:48,338,tall?570:670,466);
      if(spec[3]) {
        ctx.fillStyle='#080d0b';ctx.fillRect(64,728,640,111);
        image(ctx,load(spec[3]),74,733,620,98);
      }
      ctx.fillStyle=muted;ctx.font=`16px ${sans}`;ctx.fillText(spec[2],56,865);
    } else {
      // No invented screenshots for projects without a captured interface.
      image(ctx,load(ch.icon.getAttribute('src')),205,380,358,358);
      ctx.fillStyle=muted;ctx.font=`18px ${sans}`;ctx.fillText('独立作品 · '+String(ch.index+1).padStart(2,'0'),56,865);
    }
    rule(ctx,54,908,660,'#b9a27455');
    const notes=ch.notes.replace(/(Launched|Built with|Role)/g,' · $1: ').replace(/^ · /,'');
    ctx.fillStyle=ink;text(ctx,notes,56,945,620,18,28,2);
  } else {
    ctx.fillStyle=muted;ctx.font=`18px ${sans}`;ctx.fillText('从想法，到可以使用的作品',58,163);
    ctx.fillStyle=ink;
    const titleEnd=text(ctx,ch.title,58,229,648,40,53,3);
    rule(ctx,58,titleEnd+18,72,'#8b7043');
    ctx.fillStyle='#353c33';
    const end=text(ctx,ch.intro,58,titleEnd+83,644,28,47,8);
    const first=ch.article.querySelector('.project-copy-stack p')?.textContent.trim()||'';
    if(first&&end<760) {
      ctx.fillStyle=muted;
      text(ctx,first,58,end+38,642,20,34,Math.max(1,Math.floor((852-end)/34)));
    }
    rule(ctx,58,900,650,'#86765355');
    ctx.fillStyle='#745b32';ctx.font=`22px ${sans}`;ctx.fillText('完整介绍与产品入口  ↗',58,952);
  }
  ctx.fillStyle=muted;ctx.font=`17px ${sans}`;ctx.fillText(String(index).padStart(2,'0'),face?54:678,1010);
  ctx.restore();
}
