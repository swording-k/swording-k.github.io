import test from 'node:test';
import assert from 'node:assert/strict';
import {pageMatrix} from '../js/book-projection.mjs';
test('HTML page mapping follows each projected paper corner',()=>{
  const points=[{x:30,y:20},{x:405,y:45},{x:430,y:590},{x:5,y:560}];
  const m=pageMatrix(points),corners=[[0,0],[768,0],[768,1056],[0,1056]];
  corners.forEach(([x,y],i)=>{
    const q=m[3]*x+m[7]*y+1;
    assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/q-points[i].x)<1e-8);
    assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/q-points[i].y)<1e-8);
  });
});
