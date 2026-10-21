export function dragBookView(start,dx,dy,width,height,mode='rotate') {
  if(mode==='pan')return {...start,x:Math.max(-2,Math.min(2,start.x+dx/width*5)),y:Math.max(-2,Math.min(2,start.y-dy/height*4))};
  return {...start,yaw:start.yaw+dx/width*Math.PI*2,pitch:start.pitch+dy/height*Math.PI*2};
}
