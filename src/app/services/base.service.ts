import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PathParameters {
  [parameterName: string]: any;
}

export abstract class BaseService {
  constructor(protected http: HttpClient) {}

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
