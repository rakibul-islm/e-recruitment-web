import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requestCount = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(
    debounceTime(150),
    distinctUntilChanged()
  );

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }
}
