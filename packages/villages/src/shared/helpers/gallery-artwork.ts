export function galleryArtworkVariant(url: string, size: 320 | 1024): string | undefined {
  const match = /^\/api\/global-gallery\/file\/([A-Za-z0-9_-]{1,128})\.(jpg|jpeg|png|webp|avif)$/i.exec(url);
  if (match) return `/api/villages/artwork/${size}/${match[1]}/${match[2]}`;
}
