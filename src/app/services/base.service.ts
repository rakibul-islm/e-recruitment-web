import { HttpClient, HttpParams } from '@angular/common/http';
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

  public get<T>(url: string, paramsMap?: Map<any, any>): Observable<T> {
    const options = paramsMap ? { params: this.getHttpParams(paramsMap) } : {};
    return this.http.get<T>(url, options);
  }

  public post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  public deleteById(url: string, pathParams: PathParameters): Observable<any> {
    const finalUrl = this.createUrl(url, pathParams);
    return this.http.delete(finalUrl);
  }

  public deleteByObject(url: string, body: any): Observable<any> {
    return this.http.request('DELETE', url, { body });
  }
}
