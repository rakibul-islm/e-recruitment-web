import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class CandidateProfileService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public fetchMyProfile(): Observable<any> {
    return super.get(API_URLS.FETCH_CANDIDATE_PROFILE);
  }

  public updateMyProfile(body: any): Observable<any> {
    return super.put(API_URLS.UPDATE_CANDIDATE_PROFILE, body);
  }

  public generateCv(): Observable<any> {
    return super.post(API_URLS.GENERATE_CANDIDATE_CV, {});
  }

  public listMyCvs(): Observable<any> {
    return super.get(API_URLS.LIST_CANDIDATE_CVS);
  }

  public downloadCv(id: number): Observable<Blob> {
    const url = this.createUrl(API_URLS.DOWNLOAD_CANDIDATE_CV, { id });
    return super.getBlob(url);
  }
}
