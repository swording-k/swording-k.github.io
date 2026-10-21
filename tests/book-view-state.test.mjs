import test from 'node:test';
import assert from 'node:assert/strict';
import {dragBookView} from '../js/book-view-state.mjs';
const initial={yaw:0,pitch:0,x:0,y:0};
test('a full-width drag rotates the whole book through 360 degrees',()=>{
  const view=dragBookView(initial,800,0,800,600);
  assert.equal(view.yaw,Math.PI*2);assert.equal(view.pitch,0);
  assert.equal(initial.yaw,0);
});
test('pan mode moves the book without rotating and bounds its travel',()=>{
  const view=dragBookView(initial,200,-150,800,600,'pan');
  assert.equal(view.x,1.25);assert.equal(view.y,1);assert.equal(view.yaw,0);
  assert.equal(dragBookView(initial,80000,0,800,600,'pan').x,2);
});
