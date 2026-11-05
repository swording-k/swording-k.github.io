import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const main=await readFile(new URL('../js/main.js',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const code=main.slice(main.indexOf('    function initFootprint()'),main.indexOf('    function init() {'))+'\ninitFootprint();';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function run(fetch,cached){
 const nodes=Object.fromEntries(['footprint','footprintCount','footprintLabel','footprintSuffix'].map(id=>[id,{textContent:'',hidden:id==='footprint'&&/id="footprint"[^>]*hidden/.test(html),classList:{add(){},remove(){}}}]));
 const storage=new Map(cached===undefined?[]:[['killian_visit_count',String(cached)]]);let expire;
 vm.runInNewContext(code,{document:{getElementById:id=>nodes[id]},window:{localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}},fetch,AbortController,setTimeout:fn=>(expire=fn,1),clearTimeout(){},Number,console});
 return {nodes,storage,expire:()=>expire()};
}
test('the counter stays visible while loading and after a failed request',async()=>{
 const pending=run(()=>new Promise(()=>{}));assert.equal(pending.nodes.footprint.hidden,false);
 const failed=run(()=>Promise.reject(new Error('network')));await flush();
 assert.equal(failed.nodes.footprint.hidden,false);assert.match(failed.nodes.footprintCount.textContent,/暂时无法获取/);
});
test('an interrupted request retains a clearly labelled last confirmed count',async()=>{
 const state=run(()=>Promise.reject(new Error('network')),697);await flush();
 assert.equal(state.nodes.footprintCount.textContent,'697');assert.match(state.nodes.footprintLabel.textContent,/上次记录/);assert.equal(state.nodes.footprint.hidden,false);
});
test('only persisted non-negative integer counts replace the last confirmed value',async()=>{
 for(const data of [{count:0,persisted:true},{count:698,persisted:true}]){
  const state=run(()=>Promise.resolve({ok:true,json:async()=>data}));await flush();
  assert.equal(state.nodes.footprintCount.textContent,String(data.count));assert.equal(state.storage.get('killian_visit_count'),String(data.count));
 }
 for(const data of [{count:-2,persisted:true},{count:'oops',persisted:true},{count:0,persisted:false}]){
  const state=run(()=>Promise.resolve({ok:true,json:async()=>data}),697);await flush();
  assert.equal(state.nodes.footprintCount.textContent,'697');assert.match(state.nodes.footprintLabel.textContent,/上次记录/);
 }
});
test('a stalled request times out into a visible fallback',async()=>{
 const state=run((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout')))));
 state.expire();await flush();assert.match(state.nodes.footprintCount.textContent,/暂时无法获取/);assert.equal(state.nodes.footprint.hidden,false);
});
