import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { paintBookPage, preloadBookImages } from '../js/book-page-art.js';

const titles=['FitGenius','Atoll','WorkIsland','怪相馆','Codex Theme Creator','最后的书店','电竞天赋检测站','Codex Pet Collection','个人博客','AI Job Notes'];
const chapters=titles.map(title=>({title,label:'',intro:'',notes:'',links:[],icon:{getAttribute:()=> 'images/atoll-icon.png'}}));
test('every book image is present in the publishable tree',()=>{
  preloadBookImages(chapters,src=>assert.ok(existsSync(new URL('../'+src,import.meta.url)),src));
});
test('an unavailable screenshot retains the product icon instead of an empty mount',()=>{
  const icon={naturalWidth:128,naturalHeight:128},drawn=[];
  const ctx={canvas:{width:768,height:1056},save(){},restore(){},scale(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},
    createLinearGradient:()=>({addColorStop(){}}),measureText:v=>({width:v.length*20}),fillText(){},drawImage:(...args)=>drawn.push(args)};
  paintBookPage(ctx,1,4,chapters,src=>src==='images/atoll-icon.png'?icon:null);
  assert.ok(drawn.some(([img,,,w])=>img===icon&&w>300),'large product identity must survive screenshot failure');
});
