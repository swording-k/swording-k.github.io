import test from 'node:test';
import assert from 'node:assert/strict';
import { sheetStrip } from '../js/book-surface.mjs';
test('sheet starts flat right, ends flat left, keeps its hinge',()=>{
  for(const progress of [0,.25,.5,.75,1]) {
    const points=sheetStrip(progress,2.65,36,.5);
    assert.deepEqual(points[0],{x:0,z:0});
    assert.ok(points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)));
    const length=points.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-points[i].x,p.z-points[i].z),0);
    assert.ok(Math.abs(length-2.65)<1e-6);
  }
  assert.ok(sheetStrip(0,2.65,36)[36].x>2.64);
  assert.ok(sheetStrip(1,2.65,36)[36].x< -2.64);
});
test('mid-turn paper has a real curved elevated surface',()=>{
  const p=sheetStrip(.5,2.65,36);
  assert.ok(p[36].z>1.7);
  const a=Math.atan2(p[2].z-p[1].z,p[2].x-p[1].x);
  const b=Math.atan2(p[35].z-p[34].z,p[35].x-p[34].x);
  assert.ok(Math.abs(a-b)>.7);
});
test('a curling page stays above the desk within the chosen height budget',()=>{
  for(let t=0;t<=20;t++)for(const v of [0,.5,1]) {
    const points=sheetStrip(t/20,2.65,36,v);
    assert.ok(points.every(p=>p.z>=-1e-8));
    assert.ok(Math.max(...points.map(p=>p.z))<2.1);
  }
});
