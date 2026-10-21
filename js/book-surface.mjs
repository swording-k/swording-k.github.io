// A constant arc-length paper strip. Each sample is an actual 3D vertex.
export function sheetStrip(progress, width, segments=36, across=.5) {
  const p=Math.max(0,Math.min(1,progress+Math.sin(Math.PI*progress)*(across-.5)*.16));
  const curl=Math.sin(Math.PI*p);
  const points=[{x:0,z:0}];
  for(let i=1;i<=segments;i++) {
    const u=(i-.5)/segments;
    const angle=Math.max(0,Math.min(Math.PI,Math.PI*p+curl*((u-.5)*2.8+(across-.5)*.28)));
    const last=points[i-1],step=width/segments;
    points.push({x:last.x+Math.cos(angle)*step,z:last.z+Math.sin(angle)*step});
  }
  return points;
}
