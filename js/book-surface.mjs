// A constant arc-length paper strip. Each sample is an actual 3D vertex.
export function sheetStrip(progress, width, segments=36, across=.5) {
  const p=Math.max(0,Math.min(1,progress));
  const curl=Math.sin(Math.PI*p);
  const points=[{x:0,z:0}];
  for(let i=1;i<=segments;i++) {
    const u=(i-.5)/segments;
    const angle=Math.PI*p+curl*((u-.5)*1.3+(across-.5)*.28);
    const last=points[i-1],step=width/segments;
    points.push({x:last.x+Math.cos(angle)*step,z:last.z+Math.sin(angle)*step});
  }
  return points;
}
