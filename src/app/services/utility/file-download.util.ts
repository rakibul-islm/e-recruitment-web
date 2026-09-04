// Saves a blob (fetched via BaseService.getBlob, so the auth token could be attached) to disk
// using a throwaway <a download> element - the same trick a native download link would use, just
// driven from script since the URL itself needs an Authorization header a plain href can't send.
export function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

// Opens a blob (e.g. a PDF fetched via BaseService.getBlob) in a new tab for inline viewing,
// rather than forcing a save-to-disk. The object URL is revoked after a delay since revoking it
// immediately can race the new tab's own load of the resource.
export function openBlobInNewTab(blob: Blob): void {
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
