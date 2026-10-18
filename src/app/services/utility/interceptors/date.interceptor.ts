import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const UTC_MIDNIGHT = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(\.0+)?(Z|\+00:00)$/;

// Request: a Date at local midnight is a calendar date, sent as yyyy-MM-dd so the server's UTC zone can't shift the day.
function serialize(value: any): any {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) { return null; }
    const isDateOnly = value.getHours() === 0 && value.getMinutes() === 0 && value.getSeconds() === 0 && value.getMilliseconds() === 0;
    if (!isDateOnly) { return value.toISOString(); }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (Array.isArray(value)) { return value.map(serialize); }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.keys(value).reduce((acc, key) => { acc[key] = serialize(value[key]); return acc; }, {} as any);
  }
  return value;
}

// Response: UTC midnight is how the server writes a date-only column, revived as the same calendar day in local time.
function revive(value: any): any {
  if (typeof value === 'string') {
    const match = UTC_MIDNIGHT.exec(value);
    return match ? new Date(+match[1], +match[2] - 1, +match[3]) : value;
  }
  if (Array.isArray(value)) { return value.map(revive); }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.keys(value).reduce((acc, key) => { acc[key] = revive(value[key]); return acc; }, {} as any);
  }
  return value;
}

@Injectable()
export class DateInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const request = req.body && typeof req.body === 'object' && !(req.body instanceof FormData) && !(req.body instanceof Blob)
      ? req.clone({ body: serialize(req.body) })
      : req;

    return next.handle(request).pipe(
      map(event => event instanceof HttpResponse && event.body && request.responseType === 'json'
        ? event.clone({ body: revive(event.body) })
        : event)
    );
  }
}
