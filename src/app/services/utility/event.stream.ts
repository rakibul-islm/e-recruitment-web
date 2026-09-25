import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import { environment } from 'src/environments/environment';

const RETRY_MS = 5000;

class FatalStreamError extends Error {}

// fetch-based because the native EventSource cannot send the Authorization header
export function openEventStream(path: string, token: string | null, onMessage: (event: EventSourceMessage) => void, openWhenHidden: boolean = true): () => void {
  const controller = new AbortController();

  fetchEventSource(`${environment.baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    signal: controller.signal,
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

  return () => controller.abort();
}
