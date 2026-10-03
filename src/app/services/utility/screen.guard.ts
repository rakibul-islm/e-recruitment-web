import { registerPlugin } from '@capacitor/core';
import { isNativeApp } from './file-download.util';

interface ScreenGuardPlugin {
  enable(): Promise<void>;
  disable(): Promise<void>;
}

const ScreenGuard = registerPlugin<ScreenGuardPlugin>('ScreenGuard');

export function blockScreenCapture(): void {
  if (isNativeApp()) { ScreenGuard.enable().catch(() => {}); }
}

export function allowScreenCapture(): void {
  if (isNativeApp()) { ScreenGuard.disable().catch(() => {}); }
}
