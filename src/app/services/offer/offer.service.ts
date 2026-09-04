import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { API_URLS } from '../utility/constants/api.urls';

@Injectable({
  providedIn: 'root'
})
export class OfferService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  public createOffer(body: any): Observable<any> {
    return super.post(API_URLS.CREATE_OFFER, body);
  }

  public generateLetter(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.GENERATE_OFFER_LETTER, { id });
    return super.post(url, {});
  }

  public send(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.SEND_OFFER, { id });
    return super.put(url, {});
  }

  public findOfferById(id: number): Observable<any> {
    const url = this.createUrl(API_URLS.FIND_OFFER_BY_ID, { id });
    return super.get(url);
  }

  public findByApplication(applicationId: number): Observable<any> {
    const url = this.createUrl(API_URLS.OFFERS_BY_APPLICATION, { applicationId });
    return super.get(url);
  }

  public myOffers(): Observable<any> {
    return super.get(API_URLS.MY_OFFERS);
  }

  public respond(id: number, accept: boolean): Observable<any> {
    const url = this.createUrl(API_URLS.RESPOND_TO_OFFER, { id });
    return super.put(url, { accept });
  }

  public downloadLetter(id: number): Observable<Blob> {
    const url = this.createUrl(API_URLS.DOWNLOAD_OFFER_LETTER, { id });
    return super.getBlob(url);
  }
}
