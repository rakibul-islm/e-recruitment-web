import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  private confirmationSubject = new Subject<{ message: string, accept: Function, reject?: Function }>();

  confirmation$ = this.confirmationSubject.asObservable();

  confirm(message: string, acceptFunction: Function, rejectFunction?: Function) {
    this.confirmationSubject.next({ message, accept: acceptFunction, reject: rejectFunction });
  }
}
