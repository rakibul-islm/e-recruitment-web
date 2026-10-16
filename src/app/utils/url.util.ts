export function withHttpScheme(url?: string | null): string {
  const trimmed = (url || '').trim();
  return trimmed && !/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? 'https://' + trimmed : trimmed;
}
