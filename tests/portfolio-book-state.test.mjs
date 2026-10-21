import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterPage, pageChapter, adjacentPage } from '../js/portfolio-book-state.mjs';
test('chapter directory maps to left hand page after cover', () => {
  assert.equal(chapterPage(0, 10), 1);
  assert.equal(chapterPage(9, 10), 19);
  assert.equal(chapterPage(100, 10), 19);
  assert.equal(chapterPage(-1, 10), 1);
});
test('portrait goes from story page 2 back to title page 1',()=>{
  assert.equal(adjacentPage(2,22,true,-1),1);
  assert.equal(adjacentPage(2,22,false,-1),0);
  assert.equal(adjacentPage(0,22,false,1),1);
  assert.equal(adjacentPage(21,22,true,1),21);
});
test('both pages of a spread map to same chapter', () => {
  for(let i=0;i<10;i++) {
    assert.equal(pageChapter(1+i*2,10),i);
    assert.equal(pageChapter(2+i*2,10),i);
  }
  assert.equal(pageChapter(0,10),0);
  assert.equal(pageChapter(21,10),9);
});
