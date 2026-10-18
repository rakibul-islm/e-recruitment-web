export function displayUrl(url?: string | null): string {
  return (url || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function withHttpScheme(url?: string | null): string {
  const trimmed = (url || '').trim();
  return trimmed && !/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? 'https://' + trimmed : trimmed;
}
