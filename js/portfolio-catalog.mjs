export const BOOK_CATEGORIES=['个人产品','开源贡献','黑客松作品','工具与内容'];

// Keep the article as the content source; only reorder its book projection.
export function orderChapters(chapters) {
  return BOOK_CATEGORIES.flatMap(category=>chapters.filter(ch=>(BOOK_CATEGORIES.includes(ch.category)?ch.category:'工具与内容')===category)
    .map(ch=>({...ch,category}))).map((ch,index)=>({...ch,index}));
}

export function matchesChapter(chapter,query) {
  return `${chapter.title} ${chapter.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
