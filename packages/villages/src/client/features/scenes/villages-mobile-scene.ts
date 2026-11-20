export function mobileReadingCounter(paragraph: number, paragraphs: number, page: number, pages: number): string {
  return pages > 1
    ? `Page ${page + 1}/${pages} · paragraph ${paragraph + 1}/${Math.max(1, paragraphs)}`
    : `Paragraph ${paragraph + 1}/${Math.max(1, paragraphs)}`;
}
