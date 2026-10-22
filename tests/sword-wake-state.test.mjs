import test from 'node:test';
import assert from 'node:assert/strict';
const {sampleWake,wakeStrength,liveWake}=await import('../js/sword-wake-state.mjs').catch(()=>({}));
test('wake uses elapsed time rather than browser event frequency',()=>{
  assert.equal(typeof sampleWake,'function');
  const a=sampleWake([{x:0,y:0,t:0,speed:0}],{x:80,y:0},80);
  const b=sampleWake([{x:0,y:0,t:0,speed:0}],{x:40,y:0},40);
  assert.equal(a.at(-1).speed,b.at(-1).speed);
});
test('slow movement stays quiet and fast movement produces a bounded wake',()=>{
  assert.equal(wakeStrength(.1,0),0);
  assert.ok(wakeStrength(1.8,0)>.5);
  assert.ok(wakeStrength(100,0)<=1);
  assert.equal(wakeStrength(2,301),0);
});
test('blocked, stale and teleporting input cannot draw a slash across content',()=>{
  const points=[{x:10,y:10,t:10,speed:1}];
  assert.deepEqual(sampleWake(points,{x:30,y:30},30,true),[]);
  assert.equal(sampleWake(points,{x:30,y:30},400).length,1);
  assert.equal(sampleWake(points,{x:1500,y:30},30).length,1);
});
test('wake expires fully and sample storage remains bounded',()=>{
  let points=[];
  for(let t=0;t<100;t++)points=sampleWake(points,{x:t*3,y:20},t*2);
  assert.ok(points.length<=40);
  assert.deepEqual(liveWake(points,600),[]);
});
