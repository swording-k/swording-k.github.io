import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import vm from 'node:vm';

const main=await readFile(new URL('../js/main.js',import.meta.url),'utf8');
test('hall entrance has no competing GSAP hero timeline or infinite ticker',()=>{
  const calls=[];
  const timeline=new Proxy({}, {get:(_,method)=>(...args)=>{calls.push([method,...args]);return timeline;}});
  const gsap={registerPlugin(){},defaults(){},timeline:()=>timeline,
    fromTo:(...args)=>calls.push(['fromTo',...args]),to:(...args)=>calls.push(['to',...args])};
  const context={hasGsap:true,prefersReducedMotion:false,window:{gsap,ScrollTrigger:{batch(){},refresh(){},update(){}},addEventListener(){},setTimeout(){}},
    document:{body:{classList:{add(){}}},documentElement:{classList:{contains:()=>true}}},
    splitMotionText:()=>assert.fail('hall text must not be rebuilt after paint'),requestAnimationFrame(){}};
  vm.runInNewContext(main.slice(main.indexOf('    function initGsapMotion()'),main.indexOf('    function initActiveNav()'))+'\ninitGsapMotion();',context);
  assert.equal(calls.filter(c=>c[1]?.startsWith?.('.hero')&&!(c[2]?.scrollTrigger)).length,0);
  assert.equal(calls.filter(c=>c[1]==='.stage-timeline span').length,0);
});

test('first paint does not wait for a third-party font stylesheet',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const fontLink=html.match(/<link[^>]+fonts\.googleapis\.com\/css2[^>]+>/)?.[0];
  assert.match(fontLink||'',/media="print"/);
  assert.match(fontLink||'',/display=optional/);
});

test('hall digits use a stable local font and no whole-section entrance filter',async()=>{
  const css=await readFile(new URL('../css/hero-startup.css',import.meta.url),'utf8');
  assert.match(css,/\.metric-index/);
  assert.match(css,/font-family:\s*"SFMono-Regular", Consolas, monospace/);
  assert.doesNotMatch(css,/infinite|blur\(/);
  assert.match(main,/if \(!document\.documentElement\.classList\.contains\('sword-hall-home'\)\) initSectionEnterFX\(\)/);
});

test('hall background is small and discovered before stylesheet loading',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const preload=html.match(/<link[^>]+rel="preload"[^>]+longclaw-hall-v1\.webp[^>]+>/)?.[0];
  assert.ok(preload,'background must be discovered in the document head');
  assert.match(preload,/fetchpriority="high"/);
  assert.ok((await stat(new URL('../assets/cinematic/longclaw-hall-v1.webp',import.meta.url))).size<300000);
  for(const path of ['../css/cinematic-background.css','../css/sword-hall-home.css']){
    const css=await readFile(new URL(path,import.meta.url),'utf8');
    assert.match(css,/longclaw-hall-v1\.webp/);
    assert.doesNotMatch(css,/longclaw-hall-v1\.png/);
  }
});
