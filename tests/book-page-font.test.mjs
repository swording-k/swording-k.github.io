import test from 'node:test';
import assert from 'node:assert/strict';
import {paintBookPage} from '../js/book-page-art.js';
test('turning-page headings and body use the same Songti family as resting pages',()=>{
  const chapter={title:'测试作品 Portfolio',label:'独立开发',intro:'这是用于检查翻页正文的内容。',notes:'Launched2026',index:0,links:[],icon:{getAttribute:()=>'icon.png'}};
  for(const page of [1,2]) {
    const fonts=[];
    const ctx={canvas:{width:1024,height:1408},save(){},restore(){},scale(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},
      createLinearGradient:()=>({addColorStop(){}}),measureText:value=>({width:value.length*22}),fillText(){fonts.push(this.font);}};
    const loaded=[];
    paintBookPage(ctx,page,4,[chapter],src=>{loaded.push(src);return null;});
    assert.ok(loaded.includes('icon.png'),'both visual and story pages must retain product identity');
    assert.ok(fonts.length>=5);
    assert.ok(fonts.every(font=>font.includes('Songti SC')),fonts.join('\n'));
    assert.ok(fonts.every(font=>!font.includes('PingFang')));
  }
});
