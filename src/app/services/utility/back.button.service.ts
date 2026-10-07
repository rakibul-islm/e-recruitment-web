import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { CommonConfirmDialogService } from './common.confirm.dialog.service';
import { isNativeApp } from './file-download.util';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  constructor(private location: Location, private confirmDialog: CommonConfirmDialogService) {
    if (!isNativeApp()) { return; }
    App.addListener('backButton', ({ canGoBack }) => canGoBack ? this.location.back() : this.confirmExit());
  }

  private confirmExit(): void {
    this.confirmDialog.confirm(() => App.exitApp(), null, 'common.exitAppMessage');
  }
}
