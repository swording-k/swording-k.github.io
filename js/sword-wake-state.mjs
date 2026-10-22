export const WAKE_LIFETIME=300;
export const liveWake=(points,now)=>points.filter(p=>now-p.t<WAKE_LIFETIME);
export function wakeStrength(speed,age) {
  const motion=Math.min(1,Math.max(0,(speed-.24)/1.3));
  return motion*Math.pow(Math.max(0,1-age/WAKE_LIFETIME),1.6);
}
export function sampleWake(points,position,now,blocked=false) {
  if(blocked)return [];
  const alive=liveWake(points,now),last=alive.at(-1);
  const point={x:position.x,y:position.y,t:now,speed:0};
  if(!last||now-last.t>100)return [point];
  const distance=Math.hypot(point.x-last.x,point.y-last.y);
  if(distance>500)return [point];
  if(distance<2)return alive;
  point.speed=distance/Math.max(1,now-last.t);
  return [...alive,point].slice(-40);
}
