import { Capacitor, registerPlugin } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface FileSaverPlugin {
  save(options: { data: string; filename: string; mimeType: string }): Promise<{ uri: string }>;
  open(options: { data: string; filename: string; mimeType: string }): Promise<void>;
}

const FileSaver = registerPlugin<FileSaverPlugin>('FileSaver');

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

function mimeTypeOf(blob: Blob, filename: string): string {
  if (blob.type) { return blob.type; }
  return filename.toLowerCase().endsWith('.xlsx')
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Fallback when the native save/open is unavailable (Android 9 or older, no PDF viewer installed)
async function shareNative(base64: string, filename: string): Promise<void> {
  const { uri } = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
  await Share.share({ title: filename, url: uri }).catch(() => {});
}

async function saveNative(blob: Blob, filename: string): Promise<void> {
  const data = await blobToBase64(blob);
  await FileSaver.save({ data, filename, mimeType: mimeTypeOf(blob, filename) }).catch(() => shareNative(data, filename));
}

async function openNative(blob: Blob, filename: string): Promise<void> {
  const data = await blobToBase64(blob);
  await FileSaver.open({ data, filename, mimeType: mimeTypeOf(blob, filename) }).catch(() => shareNative(data, filename));
}

// Saves a blob (fetched via BaseService.getBlob, so the auth token could be attached) to disk
// using a throwaway <a download> element - the same trick a native download link would use, just
// driven from script since the URL itself needs an Authorization header a plain href can't send.
export function triggerDownload(blob: Blob, filename: string): void {
  if (isNativeApp()) {
    void saveNative(blob, filename);
    return;
  }
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

// Builds "<prefix>-<name>.pdf" the same way the backend names stored files (whitespace -> underscore).
export function pdfFileName(prefix: string, name?: string | null): string {
  return `${prefix}-${(name || 'candidate').trim().replace(/\s+/g, '_')}.pdf`;
}

// Opens a blob (e.g. a PDF fetched via BaseService.getBlob) in a new tab for inline viewing,
// rather than forcing a save-to-disk. The object URL is revoked after a delay since revoking it
// immediately can race the new tab's own load of the resource.
export function openBlobInNewTab(blob: Blob, filename: string = 'document.pdf'): void {
  if (isNativeApp()) {
    void openNative(blob, filename);
    return;
  }
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
