import { Injectable, NgZone } from '@angular/core';
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
  constructor(
    private location: Location,
    private router: Router,
    private ngZone: NgZone,
    private confirmDialog: CommonConfirmDialogService
  ) {
    if (!isNativeApp()) { return; }
    App.addListener('backButton', ({ canGoBack }) => {
      // Capacitor fires listeners outside Angular's zone; ngZone.run() so change detection runs now.
      this.ngZone.run(() => {
        if (this.closeTopOverlay()) { return; }
        if (this.location.path().split(/[?#]/)[0] === '/login') {
          this.router.navigateByUrl('/');
          return;
        }
        canGoBack && !this.isRootPage() ? this.location.back() : this.confirmExit();
      });
    });
  }

  private isRootPage(): boolean {
    return ROOT_PATHS.includes(this.location.path().split(/[?#]/)[0]);
  }

  private closeTopOverlay(): boolean {
    const masks = document.querySelectorAll<HTMLElement>(OVERLAY_MASKS);
    const top = masks[masks.length - 1];
    if (!top) { return false; }
    if (top.classList.contains('p-sidebar-mask')) {
      // Sidebar mask is a sibling of the container; clicking it dismisses the sidebar.
      top.click();
      return true;
    }
    const closeButton = top.querySelector<HTMLElement>(OVERLAY_CLOSE_BUTTONS);
    closeButton?.click();
    return !!closeButton;
  }

  private confirmExit(): void {
    this.confirmDialog.confirm(() => App.exitApp(), null, 'common.exitAppMessage');
  }
}
