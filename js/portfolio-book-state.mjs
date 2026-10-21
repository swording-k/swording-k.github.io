export function chapterPage(index, count) {
  return 1 + 2 * Math.max(0, Math.min(count - 1, Math.trunc(Number(index) || 0)));
}
export function pageChapter(page, count) {
  return Math.max(0, Math.min(count - 1, Math.floor((page - 1) / 2)));
}
export function adjacentPage(page, total, portrait, direction) {
  if(direction>0) return Math.min(total-1,page===0?1:page+(portrait?1:2));
  return Math.max(0,portrait?page-1:page<=2?0:page-2);
}
