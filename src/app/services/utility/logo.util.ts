import { environment } from '../../../environments/environment';

/** Public, immutable-cached (by fileId) URL - works in plain <img> tags without auth headers. */
export function organizationLogoUrl(fileId?: number | null): string | null {
  return fileId ? `${environment.baseUrl}public/logo/${fileId}` : null;
}

/** Banner image URL with the same immutable-caching scheme. */
export function bannerUrl(fileId?: number | null): string | null {
  return fileId ? `${environment.baseUrl}public/banner/${fileId}` : null;
}
