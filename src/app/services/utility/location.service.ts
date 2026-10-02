import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './security/auth.service';

export interface ClientPlace {
  city: string;
  country: string;
}

const CACHE_KEY = 'clientPlaceCache';
const REVERSE_GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';
const IP_LOOKUP_URL = 'https://ipwho.is/';
const IP_CACHE_KEY = 'clientIpPlaceCache';
const IP_CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class LocationService {
  private place: ClientPlace | null = null;
  private placeSubject = new BehaviorSubject<ClientPlace | null>(null);
  private preciseSubject = new BehaviorSubject<ClientPlace | null>(null);

  private precise = false;
  private preciseRequested = false;

  // visitors get an approximate place from their IP; the browser's location prompt only appears once someone is logged in
  constructor(authService: AuthService) {
    this.resolveFromIp();
    authService.isLoggedIn().subscribe(loggedIn => {
      if (loggedIn) { this.requestPrecisePosition(); }
    });
  }

  private requestPrecisePosition(): void {
    if (this.preciseRequested || typeof navigator === 'undefined' || !navigator.geolocation) { return; }
    this.preciseRequested = true;
    navigator.geolocation.getCurrentPosition(
      (position) => this.resolveFromCoordinates(position.coords.latitude, position.coords.longitude),
      () => { /* keep the IP-based place */ },
      { maximumAge: 600000, timeout: 10000 }
    );
  }

  place$(): Observable<ClientPlace | null> {
    return this.placeSubject.asObservable();
  }

  precisePlace$(): Observable<ClientPlace | null> {
    return this.preciseSubject.asObservable();
  }

  getHeaders(): Record<string, string> {
    if (!this.place) { return {}; }
    return {
      'X-Client-City': encodeURIComponent(this.place.city),
      'X-Client-Country': encodeURIComponent(this.place.country)
    };
  }

  private publish(place: ClientPlace | null, precise = false): void {
    if (!place || !place.country || (this.precise && !precise)) { return; }
    this.precise = this.precise || precise;
    this.place = place;
    this.placeSubject.next(place);
    if (precise) { this.preciseSubject.next(place); }
  }

  private async resolveFromCoordinates(latitude: number, longitude: number): Promise<void> {
    const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = this.readCache(key);
    if (cached) { this.publish(cached, true); return; }

    try {
      const response = await fetch(`${REVERSE_GEOCODE_URL}?format=jsonv2&zoom=16&accept-language=en&lat=${latitude}&lon=${longitude}`);
      const address = (await response.json())?.address || {};
      const area = address.neighbourhood || address.suburb || address.city_district || '';
      const main = address.city || address.town || address.village || address.state_district || address.state || '';
      const city = [area, main].filter((part, index, parts) => part && parts.indexOf(part) === index).join(', ');
      const place = { city, country: address.country || '' };
      this.writeCache(key, place);
      this.publish(place, true);
    } catch {
      this.resolveFromIp();
    }
  }

  private async resolveFromIp(): Promise<void> {
    const cached = this.readIpCache();
    if (cached) { this.publish(cached); return; }

    try {
      const data = await (await fetch(IP_LOOKUP_URL)).json();
      const place = { city: data?.city || '', country: data?.country || '' };
      if (place.country) { this.writeIpCache(place); }
      this.publish(place);
    } catch {
      /* no location available */
    }
  }

  private readIpCache(): ClientPlace | null {
    try {
      const entry = JSON.parse(localStorage.getItem(IP_CACHE_KEY) || 'null');
      return entry && Date.now() - entry.at < IP_CACHE_TTL_MS ? entry.place : null;
    } catch {
      return null;
    }
  }

  private writeIpCache(place: ClientPlace): void {
    try {
      localStorage.setItem(IP_CACHE_KEY, JSON.stringify({ place, at: Date.now() }));
    } catch {
      /* storage unavailable */
    }
  }

  private readCache(key: string): ClientPlace | null {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      return cache[key] || null;
    } catch {
      return null;
    }
  }

  private writeCache(key: string, place: ClientPlace): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ [key]: place }));
    } catch {
      /* storage unavailable */
    }
  }
}
