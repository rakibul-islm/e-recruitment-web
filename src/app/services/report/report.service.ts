import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  // Backend contract (JasperReports): GET report/:reportKey/generate?format=PDF|XLSX&timeZone=<IANA id>&<filters>
  // returns the rendered file as a blob. reportKey identifies which .jrxml template to fill.
  // timeZone is the browser's zone so dates in the report match the viewer's local time.
  public generate(reportKey: string, params: Map<any, any>): Observable<Blob> {
    const url = this.createUrl(API_URLS.GENERATE_REPORT, { reportKey });
    const withZone = new Map(params);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      withZone.set('timeZone', timeZone);
    }
    return super.getBlob(url, withZone);
  }
}
