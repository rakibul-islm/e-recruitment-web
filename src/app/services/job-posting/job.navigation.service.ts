import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobPostingService } from './job.posting.service';
import { JobPosting } from './domain/job.posting.domain';

export interface JobListState {
  jobPostings: JobPosting[];
  totalRecords: number;
  currentPage: number;
  searchParams: Map<any, any> | null;
  filterValue: any;
}

@Injectable({
  providedIn: 'root'
})
export class JobNavigationService {
  private params: Map<any, any> | null = null;
  private pages = new Map<number, string[]>();
  private totalPages = 0;
  private totalElements = 0;

  private listState: JobListState | null = null;

  constructor(private jobPostingService: JobPostingService) {}

  saveListState(state: JobListState): void {
    this.listState = state;
  }

  getListState(): JobListState | null {
    return this.listState;
  }

  remember(params: Map<any, any>, uuids: string[], totalElements: number, append = false): void {
    const size = params.get('size') || 1;
    this.params = new Map(params);
    const page = params.get('page') || 0;
    if (append) {
      this.pages.set(page, uuids);
    } else {
      this.pages = new Map([[page, uuids]]);
    }
    this.totalElements = totalElements;
    this.totalPages = Math.ceil(totalElements / size);
  }

  isNavigable(uuid: string): boolean {
    return this.locate(uuid) !== null && this.totalElements > 1;
  }

  hasPrevious(uuid: string): boolean {
    const loc = this.locate(uuid);
    return !!loc && (loc.index > 0 || loc.page > 0);
  }

  hasNext(uuid: string): boolean {
    const loc = this.locate(uuid);
    return !!loc && (loc.index < this.pages.get(loc.page)!.length - 1 || loc.page < this.totalPages - 1);
  }

  previous(uuid: string): Observable<string | null> {
    return this.adjacent(uuid, -1);
  }

  next(uuid: string): Observable<string | null> {
    return this.adjacent(uuid, 1);
  }

  private locate(uuid: string): { page: number; index: number } | null {
    for (const [page, uuids] of this.pages) {
      const index = uuids.indexOf(uuid);
      if (index >= 0) { return { page, index }; }
    }
    return null;
  }

  private adjacent(uuid: string, step: 1 | -1): Observable<string | null> {
    const loc = this.locate(uuid);
    if (!loc || !this.params) { return of(null); }

    const current = this.pages.get(loc.page)!;
    const target = current[loc.index + step];
    if (target) { return of(target); }

    const targetPage = loc.page + step;
    if (targetPage < 0 || targetPage >= this.totalPages) { return of(null); }

    const pick = (uuids: string[]) => (step === 1 ? uuids[0] : uuids[uuids.length - 1]) || null;
    const cached = this.pages.get(targetPage);
    if (cached) { return of(pick(cached)); }

    const params = new Map(this.params);
    params.set('page', targetPage);
    return this.jobPostingService.searchJobPostings(params).pipe(
      map((response: any) => {
        const uuids: string[] = (response?.page?.content || []).map((j: any) => j.uuid);
        this.pages.set(targetPage, uuids);
        return pick(uuids);
      })
    );
  }
}
