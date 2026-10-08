import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { CommonConfirmDialogService } from './common.confirm.dialog.service';
import { isNativeApp } from './file-download.util';
import { Router } from '@angular/router';

const ROOT_PATHS = ['', '/', '/dashboard'];
const OVERLAY_MASKS = '.p-sidebar-mask:not(.p-component-overlay-leave), .p-dialog-mask:not(.p-component-overlay-leave)';
const OVERLAY_CLOSE_BUTTONS = '.p-sidebar-close, .p-dialog-header-close, .p-confirm-dialog-reject';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  constructor(private location: Location, private router: Router,
    private confirmDialog: CommonConfirmDialogService) {
    if (!isNativeApp()) { return; }
    App.addListener('backButton', ({ canGoBack }) => {
      if (this.closeTopOverlay()) { return; }
      if (this.location.path().split(/[?#]/)[0] === '/login') {
        this.router.navigateByUrl('/');
        return;
      }
      canGoBack && !this.isRootPage() ? this.location.back() : this.confirmExit();
    });
  }

  private isRootPage(): boolean {
    return ROOT_PATHS.includes(this.location.path().split(/[?#]/)[0]);
  }

  private closeTopOverlay(): boolean {
    const masks = document.querySelectorAll(OVERLAY_MASKS);
    const top = masks[masks.length - 1];
    if (!top) { return false; }
    top.querySelector<HTMLElement>(OVERLAY_CLOSE_BUTTONS)?.click();
    return true;
  }

  private confirmExit(): void {
    this.confirmDialog.confirm(() => App.exitApp(), null, 'common.exitAppMessage');
  }
}
