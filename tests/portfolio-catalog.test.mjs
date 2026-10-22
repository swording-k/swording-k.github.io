import test from 'node:test';
import assert from 'node:assert/strict';
import {orderChapters,matchesChapter} from '../js/portfolio-catalog.mjs';
import {chapterPage} from '../js/portfolio-book-state.mjs';

test('grouping preserves every article once and assigns contiguous physical page indices',()=>{
  const source=[{title:'Atoll',category:'开源贡献'},{title:'FitGenius',category:'个人产品'},
    {title:'LoveCourt',category:'黑客松作品'},{title:'WorkIsland',category:'个人产品'},{title:'Notes'}];
  const chapters=orderChapters(source);
  assert.deepEqual(chapters.map(ch=>ch.title),['FitGenius','WorkIsland','Atoll','LoveCourt','Notes']);
  assert.equal(chapters.length,source.length);
  assert.deepEqual(chapters.map(ch=>chapterPage(ch.index,chapters.length)),[1,3,5,7,9]);
  assert.equal(chapters.at(-1).category,'工具与内容');
  assert.equal(source[0].index,undefined,'do not mutate original article metadata');
});
test('catalog search matches product names or category names',()=>{
  assert.equal(matchesChapter({title:'LoveCourt',category:'黑客松作品'},'  lovecourt '),true);
  assert.equal(matchesChapter({title:'Atoll',category:'开源贡献'},'开源'),true);
  assert.equal(matchesChapter({title:'FitGenius',category:'个人产品'},'开源'),false);
});
