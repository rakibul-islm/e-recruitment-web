import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { environment } from 'src/environments/environment';
import { isNativeApp } from './file-download.util';

const RETRY_MS = 5000;

class FatalStreamError extends Error {}

// fetch-based because the native EventSource cannot send the Authorization header
export function openEventStream(path: string, token: string | null, onMessage: (event: EventSourceMessage) => void, openWhenHidden: boolean = true, extraHeaders: Record<string, string> = {}): () => void {
  let controller = new AbortController();
  let closed = false;

  const connect = (): void => {
    const current = controller;
    fetchEventSource(`${environment.baseUrl}${path}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extraHeaders },
      credentials: 'include',
      signal: current.signal,
      openWhenHidden,
      onopen: async (response) => {
        if (response.ok && response.headers.get('content-type')?.startsWith('text/event-stream')) { return; }
        if (response.status >= 400 && response.status < 500 && response.status !== 429) { throw new FatalStreamError(); }
        throw new Error(`Unexpected stream response ${response.status}`);
      },
      onmessage: onMessage,
      onclose: () => { throw new Error('Stream closed by server'); },
      onerror: (error) => {
        if (error instanceof FatalStreamError) { throw error; }
        return RETRY_MS;
      }
    }).catch(() => { /* aborted, or rejected for good (4xx) */ });
  };

  // Android suspends the WebView in the background and its sockets can die without any close event
  const reconnectOnResume = (): void => {
    if (closed || document.hidden) { return; }
    controller.abort();
    controller = new AbortController();
    connect();
  };

  if (isNativeApp()) { document.addEventListener('visibilitychange', reconnectOnResume); }
  connect();

  return () => {
    closed = true;
    document.removeEventListener('visibilitychange', reconnectOnResume);
    controller.abort();
  };
}
