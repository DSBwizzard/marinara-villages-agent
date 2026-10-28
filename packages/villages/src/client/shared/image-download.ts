/** Engine owns device-specific saving, cancellation and download failures. */
export async function downloadSpriteImage(url: string, filename: string) {
  const host = (
    globalThis as typeof globalThis & {
      __MARINARA_HOST__: { api: { api: { download: (path: string, filename: string) => Promise<unknown> } } };
    }
  ).__MARINARA_HOST__;
  await host.api.api.download(url.replace(/^\/api(?=\/)/, ""), filename);
}
