import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface PathParameters {
  [parameterName: string]: any;
}

type RecordKey = string | number;

export abstract class BaseService {
  private navUrl = '';
  private navParams: Map<any, any> | null = null;
  private navQuery = '';
  private navPages = new Map<number, string[]>();
  private navTotalPages = 0;
  private navTotalElements = 0;

  constructor(protected http: HttpClient) {}

  // Paged search that also remembers the result set, so a detail page can step through it.
  protected searchPage(url: string, paramsMap: Map<any, any>): Observable<any> {
    return this.get<any>(url, paramsMap).pipe(tap(response => this.rememberResults(url, paramsMap, response)));
  }

  private rememberResults(url: string, params: Map<any, any>, response: any): void {
    const records: any[] = response?.page?.content;
    if (!Array.isArray(records)) { return; }
    const page = params.get('page') || 0;
    const query = JSON.stringify([...params].filter(([key]) => key !== 'page').sort());
    const keepPages = page > 0 && url === this.navUrl && query === this.navQuery;
    const ids = records.map(record => String(record.uuid ?? record.id));
    this.navUrl = url;
    this.navQuery = query;
    this.navParams = new Map(params);
    this.navPages = keepPages ? new Map(this.navPages).set(page, ids) : new Map([[page, ids]]);
    this.navTotalElements = response.page.totalElements || 0;
    this.navTotalPages = Math.ceil(this.navTotalElements / (params.get('size') || 1));
  }

  public isNavigable(id: RecordKey): boolean {
    return this.locate(id) !== null && this.navTotalElements > 1;
  }

  public hasPrevious(id: RecordKey): boolean {
    const loc = this.locate(id);
    return !!loc && (loc.index > 0 || loc.page > 0);
  }

  public hasNext(id: RecordKey): boolean {
    const loc = this.locate(id);
    return !!loc && (loc.index < this.navPages.get(loc.page)!.length - 1 || loc.page < this.navTotalPages - 1);
  }

  public previousId(id: RecordKey): Observable<string | null> {
    return this.adjacentId(id, -1);
  }

  public nextId(id: RecordKey): Observable<string | null> {
    return this.adjacentId(id, 1);
  }

  private locate(id: RecordKey): { page: number; index: number } | null {
    const key = String(id);
    for (const [page, ids] of this.navPages) {
      const index = ids.indexOf(key);
      if (index >= 0) { return { page, index }; }
    }
    return null;
  }

  private adjacentId(id: RecordKey, step: 1 | -1): Observable<string | null> {
    const loc = this.locate(id);
    if (!loc || !this.navParams) { return of(null); }

    const target = this.navPages.get(loc.page)![loc.index + step];
    if (target) { return of(target); }

    const targetPage = loc.page + step;
    if (targetPage < 0 || targetPage >= this.navTotalPages) { return of(null); }

    const pick = (ids: string[]) => (step === 1 ? ids[0] : ids[ids.length - 1]) || null;
    const cached = this.navPages.get(targetPage);
    if (cached) { return of(pick(cached)); }

    const params = new Map(this.navParams);
    params.set('page', targetPage);
    return this.get<any>(this.navUrl, params).pipe(
      map(response => {
        const ids: string[] = (response?.page?.content || []).map((record: any) => String(record.uuid ?? record.id));
        this.navPages.set(targetPage, ids);
        return pick(ids);
      })
    );
  }

  protected getHttpParams(paramsMap: Map<any, any>): HttpParams {
    let params = new HttpParams();
    paramsMap.forEach((value, key) => {
      params = params.set(key, value);
    });
    return params;
  }

  protected createUrl(endpoint: string, pathParams?: PathParameters): string {
    let url = endpoint;
    if (pathParams) {
      Object.keys(pathParams).forEach((key) => {
        url = url.replace(`:${key}`, encodeURIComponent(pathParams[key]));
      });
    }
    return url;
  }

  public get<T>(url: string, paramsMap?: Map<any, any>, context?: HttpContext): Observable<T> {
    const options = { params: paramsMap ? this.getHttpParams(paramsMap) : undefined, context };
    return this.http.get<T>(url, options);
  }

  // A plain <a href> download can't carry the Authorization header AuthInterceptor adds, so file
  // downloads (CVs, resumes) go through HttpClient as a blob and get saved via triggerDownload.
  public getBlob(url: string, paramsMap?: Map<any, any>): Observable<Blob> {
    const params = paramsMap ? this.getHttpParams(paramsMap) : undefined;
    return this.http.get(url, { responseType: 'blob', params });
  }

  public post<T>(url: string, body: any, context?: HttpContext): Observable<T> {
    return this.http.post<T>(url, body, { context });
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  public deleteById(url: string, pathParams: PathParameters): Observable<any> {
    const finalUrl = this.createUrl(url, pathParams);
    return this.http.delete(finalUrl);
  }

  public removeById(url: string, pathParams: PathParameters): Observable<any> {
    const finalUrl = this.createUrl(url, pathParams);
    return this.http.delete(finalUrl);
  }
}
